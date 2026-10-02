import { CATEGORIES } from './categories.js'

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

// カテゴリ定義の順序で [{ id, label, amount, share }] を返す（0円のカテゴリも含む）
export function sumByCategory(expenses) {
  const sums = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]))
  for (const e of expenses) {
    if (e.category in sums) sums[e.category] += Number(e.amount) || 0
  }
  const all = Object.values(sums).reduce((a, b) => a + b, 0)
  return CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    amount: sums[c.id],
    share: all > 0 ? sums[c.id] / all : 0,
  }))
}

export function sortByDateDesc(expenses) {
  return [...expenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function formatYen(n) {
  return `¥${Math.round(Number(n) || 0).toLocaleString('ja-JP')}`
}
