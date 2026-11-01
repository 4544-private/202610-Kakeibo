import { describe, it, expect } from 'vitest'
import { DEFAULT_CATEGORIES, normalizeCategories, validateLabel, nextColor, createCategory, colorVar, findCategory } from './categories.js'

describe('normalizeCategories', () => {
  it('配列でない・空なら初期カテゴリ', () => {
    expect(normalizeCategories(null)).toEqual(DEFAULT_CATEGORIES)
    expect(normalizeCategories([])).toEqual(DEFAULT_CATEGORIES)
  })
  it('id や名前の重複・空の名前・不正な色を除く／直す', () => {
    const r = normalizeCategories([
      { id: 'a', label: ' 食費 ', color: 1 },
      { id: 'a', label: '別', color: 2 },
      { id: 'b', label: '食費', color: 3 },
      { id: 'c', label: '', color: 4 },
      { id: 'd', label: '雑費', color: 99 },
    ])
    expect(r).toEqual([
      { id: 'a', label: '食費', hint: '', color: 1 },
      { id: 'd', label: '雑費', hint: '', color: 0 },
    ])
  })
})

describe('validateLabel', () => {
  it('空・長すぎ・重複はエラー、自分自身との重複は可', () => {
    expect(validateLabel('  ', DEFAULT_CATEGORIES)).toBeTruthy()
    expect(validateLabel('あ'.repeat(21), DEFAULT_CATEGORIES)).toBeTruthy()
    expect(validateLabel('外食', DEFAULT_CATEGORIES)).toBeTruthy()
    expect(validateLabel('外食', DEFAULT_CATEGORIES, 'eatout')).toBeNull()
    expect(validateLabel('日用品', DEFAULT_CATEGORIES)).toBeNull()
  })
})

describe('nextColor / createCategory', () => {
  it('未使用の色を順に選び、8 色とも使用中ならグレー', () => {
    expect(nextColor(DEFAULT_CATEGORIES)).toBe(6)
    const full = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ id: `${n}`, label: `${n}`, color: n }))
    expect(nextColor(full)).toBe(0)
  })
  it('新しい id で作り、名前の前後の空白を除く', () => {
    const c = createCategory({ label: ' 日用品 ' }, DEFAULT_CATEGORIES)
    expect(c.label).toBe('日用品')
    expect(c.color).toBe(6)
    expect(DEFAULT_CATEGORIES.some((d) => d.id === c.id)).toBe(false)
  })
})

describe('colorVar / findCategory', () => {
  it('範囲外の色はグレー、未定義のカテゴリは (不明)', () => {
    expect(colorVar(3)).toBe('var(--cat-c3)')
    expect(colorVar(undefined)).toBe('var(--cat-c0)')
    expect(findCategory(DEFAULT_CATEGORIES, 'gone').label).toBe('(不明)')
  })
})
