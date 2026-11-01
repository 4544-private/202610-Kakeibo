import { normalizeCategories } from './categories.js'

const KEY = 'kakeibo.expenses.v1'
const CATEGORIES_KEY = 'kakeibo.categories.v1'

function loadJson(key, storage) {
  try {
    const raw = storage?.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveJson(key, value, storage) {
  try {
    storage?.setItem(key, JSON.stringify(value))
  } catch {
    // 容量超過やプライベートモードでは保存できないが、画面上の動作は継続させる
  }
}

export function loadExpenses(storage = globalThis.localStorage) {
  const data = loadJson(KEY, storage)
  return Array.isArray(data) ? data : []
}

export function saveExpenses(expenses, storage = globalThis.localStorage) {
  saveJson(KEY, expenses, storage)
}

// 未保存（この機能より前から使っている端末を含む）なら初期カテゴリ
export function loadCategories(storage = globalThis.localStorage) {
  return normalizeCategories(loadJson(CATEGORIES_KEY, storage))
}

export function saveCategories(categories, storage = globalThis.localStorage) {
  saveJson(CATEGORIES_KEY, categories, storage)
}
