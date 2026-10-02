import { ref, watch } from 'vue'
import { loadExpenses, saveExpenses } from '../lib/storage.js'
import { newId } from '../lib/id.js'

// アプリ全体で 1 つの支出リストを共有する
const expenses = ref(loadExpenses())
watch(expenses, (v) => saveExpenses(v), { deep: true })

export function useExpenses() {
  function add({ date, category, amount, memo }) {
    expenses.value.push({ id: newId(), date, category, amount: Number(amount), memo: memo ?? '' })
  }
  function update(id, patch) {
    const i = expenses.value.findIndex((e) => e.id === id)
    if (i >= 0) expenses.value[i] = { ...expenses.value[i], ...patch, amount: Number(patch.amount ?? expenses.value[i].amount) }
  }
  function remove(id) {
    expenses.value = expenses.value.filter((e) => e.id !== id)
  }
  function append(list) {
    expenses.value = [...expenses.value, ...list]
  }
  function replaceAll(list) {
    expenses.value = [...list]
  }
  return { expenses, add, update, remove, append, replaceAll }
}
