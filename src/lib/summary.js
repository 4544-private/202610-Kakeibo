import { DEFAULT_CATEGORIES, UNKNOWN_CATEGORY } from './categories.js'

// 'YYYY-MM' を返す
export function monthOf(date) {
  return String(date).slice(0, 7)
}

export function filterByMonth(expenses, month) {
  return expenses.filter((e) => monthOf(e.date) === month)
}

export function total(expenses) {
  return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
}

// カテゴリの並び順で [{ id, label, color, amount, share }] を返す（0円のカテゴリも含む）。
// 定義が見つからないカテゴリの明細があれば、末尾に「(不明)」の行を足す
export function sumByCategory(expenses, categories = DEFAULT_CATEGORIES) {
  const sums = Object.fromEntries(categories.map((c) => [c.id, 0]))
  let unknown = 0
  for (const e of expenses) {
    const v = Number(e.amount) || 0
    if (e.category in sums) sums[e.category] += v
    else unknown += v
  }
  const rows = categories.map((c) => ({ id: c.id, label: c.label, color: c.color, amount: sums[c.id] }))
  if (unknown !== 0) rows.push({ id: UNKNOWN_CATEGORY.id, label: UNKNOWN_CATEGORY.label, color: UNKNOWN_CATEGORY.color, amount: unknown })
  const all = rows.reduce((a, x) => a + x.amount, 0)
  return rows.map((x) => ({ ...x, share: all > 0 ? x.amount / all : 0 }))
}

export function sortByDateDesc(expenses) {
  return [...expenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function formatYen(n) {
  return `¥${Math.round(Number(n) || 0).toLocaleString('ja-JP')}`
}
