import { describe, it, expect } from 'vitest'
import { filterByMonth, sumByCategory, total, sortByDateDesc, formatYen } from './summary.js'

const data = [
  { id: '1', date: '2026-10-01', category: 'super', amount: 1000 },
  { id: '2', date: '2026-10-15', category: 'super', amount: 500 },
  { id: '3', date: '2026-10-20', category: 'eatout', amount: 1500 },
  { id: '4', date: '2026-09-30', category: 'snack', amount: 300 },
]

describe('filterByMonth / total', () => {
  it('月で絞り込める', () => {
    const oct = filterByMonth(data, '2026-10')
    expect(oct.map((e) => e.id)).toEqual(['1', '2', '3'])
    expect(total(oct)).toBe(3000)
  })
})

describe('sumByCategory', () => {
  it('全カテゴリを定義順で返し、割合を計算する', () => {
    const r = sumByCategory(filterByMonth(data, '2026-10'))
    expect(r.map((x) => x.id)).toEqual(['super', 'eatout', 'cafe_weekday', 'cafe_holiday', 'snack'])
    expect(r[0].amount).toBe(1500)
    expect(r[0].share).toBeCloseTo(0.5)
    expect(r[2].amount).toBe(0)
  })
  it('データなしでは割合0', () => {
    expect(sumByCategory([]).every((x) => x.share === 0)).toBe(true)
  })
})

describe('sortByDateDesc', () => {
  it('新しい順に並べ、元配列は変えない', () => {
    const sorted = sortByDateDesc(data)
    expect(sorted[0].id).toBe('3')
    expect(data[0].id).toBe('1')
  })
})

describe('formatYen', () => {
  it('円記号と桁区切り', () => {
    expect(formatYen(1234567)).toBe('¥1,234,567')
  })
})
