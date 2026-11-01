import { describe, it, expect } from 'vitest'
import { loadExpenses, saveExpenses, loadCategories, saveCategories } from './storage.js'
import { DEFAULT_CATEGORIES } from './categories.js'

function memStorage() {
  const m = new Map()
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }
}

describe('storage', () => {
  it('保存して読み戻せる', () => {
    const s = memStorage()
    saveExpenses([{ id: 'a', date: '2026-10-01', category: 'super', amount: 1 }], s)
    expect(loadExpenses(s)).toEqual([{ id: 'a', date: '2026-10-01', category: 'super', amount: 1 }])
  })
  it('未保存・壊れたデータは空配列', () => {
    expect(loadExpenses(memStorage())).toEqual([])
    const s = memStorage()
    s.setItem('kakeibo.expenses.v1', '{broken')
    expect(loadExpenses(s)).toEqual([])
  })
  it('カテゴリ未保存（従来の端末）では初期カテゴリを返し、既存の明細の id と一致する', () => {
    const s = memStorage()
    s.setItem('kakeibo.expenses.v1', JSON.stringify([{ id: 'a', date: '2026-10-01', category: 'snack', amount: 1 }]))
    const cats = loadCategories(s)
    expect(cats).toEqual(DEFAULT_CATEGORIES)
    expect(cats.some((c) => c.id === loadExpenses(s)[0].category)).toBe(true)
  })
  it('カテゴリを保存して読み戻せる。壊れたデータは初期カテゴリ', () => {
    const s = memStorage()
    saveCategories([{ id: 'x', label: '日用品', hint: '', color: 6 }], s)
    expect(loadCategories(s)).toEqual([{ id: 'x', label: '日用品', hint: '', color: 6 }])
    s.setItem('kakeibo.categories.v1', '{broken')
    expect(loadCategories(s)).toEqual(DEFAULT_CATEGORIES)
  })
})
