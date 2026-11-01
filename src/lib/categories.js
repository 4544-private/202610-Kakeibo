import { newId } from './id.js'

// 色の枠。1〜8 は dataviz 検証済みのカテゴリ色（style.css の --cat-c1〜c8）、0 はグレー。
// 9 件目以降のカテゴリに新しい色相は作らず、既存の色の再利用かグレーにする。
export const PALETTE = [
  { slot: 1, name: '青' },
  { slot: 2, name: 'オレンジ' },
  { slot: 3, name: '水色' },
  { slot: 4, name: '黄' },
  { slot: 5, name: 'ピンク' },
  { slot: 6, name: '緑' },
  { slot: 7, name: '紫' },
  { slot: 8, name: '赤' },
  { slot: 0, name: 'グレー' },
]

// 初期カテゴリ。id は既存の保存データ（kakeibo.expenses.v1 の category）と一致させること
export const DEFAULT_CATEGORIES = [
  { id: 'super', label: 'スーパー', hint: 'スーパーで買った物はスイーツでも弁当でもここ', color: 1 },
  { id: 'eatout', label: '外食', hint: '', color: 2 },
  { id: 'cafe_weekday', label: 'カフェ(平日)', hint: '', color: 3 },
  { id: 'cafe_holiday', label: 'カフェ(休日)', hint: '', color: 4 },
  { id: 'snack', label: '買い食い', hint: 'シャトレーゼ等、スーパー以外で買ったスイーツ', color: 5 },
]

// 削除済みなど、定義が見つからないカテゴリの明細の表示用
export const UNKNOWN_CATEGORY = { id: '__unknown', label: '(不明)', hint: '', color: 0 }

export const LABEL_MAX = 20

export function colorVar(slot) {
  return `var(--cat-c${Number.isInteger(slot) && slot >= 0 && slot <= 8 ? slot : 0})`
}

export function categoryMap(categories) {
  return Object.fromEntries(categories.map((c) => [c.id, c]))
}

export function findCategory(categories, id) {
  return categories.find((c) => c.id === id) ?? UNKNOWN_CATEGORY
}

// 保存データを検証して整える。壊れている・空なら初期カテゴリ
export function normalizeCategories(data) {
  if (!Array.isArray(data)) return DEFAULT_CATEGORIES.map((c) => ({ ...c }))
  const seenId = new Set()
  const seenLabel = new Set()
  const list = []
  for (const c of data) {
    if (!c || typeof c.id !== 'string' || !c.id || seenId.has(c.id)) continue
    const label = String(c.label ?? '').trim()
    if (!label || seenLabel.has(label)) continue
    seenId.add(c.id)
    seenLabel.add(label)
    list.push({ id: c.id, label, hint: String(c.hint ?? ''), color: Number.isInteger(c.color) && c.color >= 0 && c.color <= 8 ? c.color : 0 })
  }
  return list.length > 0 ? list : DEFAULT_CATEGORIES.map((c) => ({ ...c }))
}

// 名前の検査。問題なければ null、あればメッセージ
export function validateLabel(label, categories, selfId = null) {
  const s = String(label ?? '').trim()
  if (!s) return '名前を入力してください'
  if (s.length > LABEL_MAX) return `名前は ${LABEL_MAX} 文字以内にしてください`
  if (categories.some((c) => c.label === s && c.id !== selfId)) return `「${s}」は既にあります`
  return null
}

// まだ使われていない最初の色。8 色とも使用中ならグレー
export function nextColor(categories) {
  const used = new Set(categories.map((c) => c.color))
  return PALETTE.find((p) => p.slot !== 0 && !used.has(p.slot))?.slot ?? 0
}

export function createCategory({ label, hint = '', color }, categories) {
  return { id: newId(), label: String(label).trim(), hint: String(hint ?? ''), color: color ?? nextColor(categories) }
}
