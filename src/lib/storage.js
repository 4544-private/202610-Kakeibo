const KEY = 'kakeibo.expenses.v1'

export function loadExpenses(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function saveExpenses(expenses, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(expenses))
  } catch {
    // 容量超過やプライベートモードでは保存できないが、画面上の動作は継続させる
  }
}
