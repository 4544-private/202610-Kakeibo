import { describe, it, expect } from 'vitest'
import { loadExpenses, saveExpenses } from './storage.js'

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
})
