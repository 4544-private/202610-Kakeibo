import { describe, it, expect } from 'vitest'
import { toCsv, fromCsv, parseCsvRows } from './csv.js'

const sample = [
  { id: 'a', date: '2026-10-01', category: 'super', amount: 1200, memo: '夕飯' },
  { id: 'b', date: '2026-10-02', category: 'cafe_weekday', amount: 480, memo: 'メモ,カンマ "引用" 付き' },
]

describe('toCsv', () => {
  it('BOM付きUTF-8・CRLF・日本語見出しで出力する', () => {
    const csv = toCsv(sample)
    expect(csv.startsWith('﻿日付,カテゴリ,金額,メモ\r\n')).toBe(true)
    expect(csv).toContain('2026-10-01,スーパー,1200,夕飯\r\n')
    expect(csv).toContain('2026-10-02,カフェ(平日),480,"メモ,カンマ ""引用"" 付き"\r\n')
  })
})

describe('parseCsvRows', () => {
  it('引用符内のカンマ・改行・""を扱う', () => {
    expect(parseCsvRows('a,"b,c","d""e"\r\n"x\ny",z')).toEqual([
      ['a', 'b,c', 'd"e'],
      ['x\ny', 'z'],
    ])
  })
  it('末尾の空行を無視する', () => {
    expect(parseCsvRows('a,b\n\n')).toEqual([['a', 'b']])
  })
})

describe('fromCsv', () => {
  it('toCsv の出力を往復できる', () => {
    const { expenses, errors } = fromCsv(toCsv(sample))
    expect(errors).toEqual([])
    expect(expenses.map(({ id, ...rest }) => rest)).toEqual(sample.map(({ id, ...rest }) => rest))
    expect(expenses[0].id).toBeTruthy()
  })
  it('不正行はエラーに集め、正常行は取り込む', () => {
    const csv = '日付,カテゴリ,金額,メモ\n2026-10-01,スーパー,100,\n2026/10/01,外食,200,\n2026-10-03,謎,300,\n2026-10-04,外食,abc,\n'
    const { expenses, errors } = fromCsv(csv)
    expect(expenses).toHaveLength(1)
    expect(errors.map((e) => e.line)).toEqual([3, 4, 5])
  })
  it('見出しが違えばエラー', () => {
    const { expenses, errors } = fromCsv('date,cat,amt\n2026-10-01,x,1\n')
    expect(expenses).toEqual([])
    expect(errors).toHaveLength(1)
  })
  it('金額の ¥ とカンマ区切りを許容する', () => {
    const { expenses } = fromCsv('日付,カテゴリ,金額\n2026-10-01,外食,"¥1,500"\n')
    expect(expenses[0].amount).toBe(1500)
    expect(expenses[0].memo).toBe('')
  })
})
