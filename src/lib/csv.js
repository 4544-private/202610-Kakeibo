import { CATEGORY_BY_LABEL, categoryLabel } from './categories.js'
import { newId } from './id.js'

export const CSV_HEADER = ['日付', 'カテゴリ', '金額', 'メモ']

function escapeCell(value) {
  const s = String(value ?? '')
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Excel で開けるよう UTF-8 BOM + CRLF
export function toCsv(expenses) {
  const lines = [CSV_HEADER.join(',')]
  for (const e of expenses) {
    lines.push([e.date, categoryLabel(e.category), e.amount, e.memo ?? ''].map(escapeCell).join(','))
  }
  return '﻿' + lines.join('\r\n') + '\r\n'
}

// RFC4180 相当の最小パーサ。引用符内の改行・カンマ・"" に対応
export function parseCsvRows(text) {
  const src = text.replace(/^﻿/, '')
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

// 戻り値: { expenses, errors: [{ line, message }] }
export function fromCsv(text) {
  const rows = parseCsvRows(text)
  const expenses = []
  const errors = []
  if (rows.length === 0) return { expenses, errors: [{ line: 0, message: 'データがありません' }] }

  const header = rows[0].map((h) => h.trim())
  const col = (name) => header.indexOf(name)
  const idx = { date: col('日付'), category: col('カテゴリ'), amount: col('金額'), memo: col('メモ') }
  if (idx.date < 0 || idx.category < 0 || idx.amount < 0) {
    return { expenses, errors: [{ line: 1, message: `見出し行が不正です（期待: ${CSV_HEADER.join(',')}）` }] }
  }

  rows.slice(1).forEach((r, i) => {
    const line = i + 2
    const date = (r[idx.date] ?? '').trim()
    const label = (r[idx.category] ?? '').trim()
    const amountStr = (r[idx.amount] ?? '').trim().replace(/[¥,]/g, '')
    const memo = idx.memo >= 0 ? (r[idx.memo] ?? '') : ''

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push({ line, message: `日付の形式が不正です: ${date}` })
      return
    }
    const category = CATEGORY_BY_LABEL[label]
    if (!category) {
      errors.push({ line, message: `不明なカテゴリです: ${label}` })
      return
    }
    const amount = Number(amountStr)
    if (!Number.isFinite(amount)) {
      errors.push({ line, message: `金額が数値ではありません: ${amountStr}` })
      return
    }
    expenses.push({ id: newId(), date, category: category.id, amount, memo })
  })
  return { expenses, errors }
}
