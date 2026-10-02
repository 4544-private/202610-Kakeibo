<script setup>
import { computed, ref } from 'vue'
import { useExpenses } from './composables/useExpenses.js'
import { filterByMonth, sumByCategory, sortByDateDesc, monthOf } from './lib/summary.js'
import MonthSelector from './components/MonthSelector.vue'
import ExpenseForm from './components/ExpenseForm.vue'
import ExpenseList from './components/ExpenseList.vue'
import CategoryDonut from './components/CategoryDonut.vue'
import CsvImportExport from './components/CsvImportExport.vue'

const { expenses, add, update, remove, append, replaceAll } = useExpenses()

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const today = todayStr()
const month = ref(monthOf(today))
const editing = ref(null)

const monthly = computed(() => sortByDateDesc(filterByMonth(expenses.value, month.value)))
const byCategory = computed(() => sumByCategory(monthly.value))

// 入力フォームの日付初期値: 表示中の月が今月なら今日、そうでなければその月の1日
const defaultDate = computed(() => (month.value === monthOf(today) ? today : `${month.value}-01`))

function onSubmit(data) {
  if (editing.value) {
    update(editing.value.id, data)
    editing.value = null
  } else {
    add(data)
  }
  month.value = monthOf(data.date)
}
function onRemove(e) {
  if (confirm(`${e.date} の ${e.amount} 円を削除しますか？`)) remove(e.id)
}
function onImport({ expenses: list, mode }) {
  mode === 'replace' ? replaceAll(list) : append(list)
}
</script>

<template>
  <div class="min-h-screen bg-base-200">
    <div class="navbar bg-base-100 shadow">
      <span class="text-xl font-bold px-2">家計簿</span>
    </div>
    <main class="max-w-5xl mx-auto p-4 flex flex-col gap-4">
      <div class="flex justify-center">
        <MonthSelector v-model="month" />
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <ExpenseForm :key="editing?.id ?? 'new'" :editing="editing" :default-date="defaultDate" @submit="onSubmit" @cancel="editing = null" />
        <CategoryDonut :rows="byCategory" />
      </div>
      <ExpenseList :expenses="monthly" @edit="editing = $event" @remove="onRemove" />
      <CsvImportExport :expenses="expenses" @import="onImport" />
    </main>
  </div>
</template>
