<script setup>
import { ref } from 'vue'
import { toCsv, fromCsv } from '../lib/csv.js'

const props = defineProps({ expenses: { type: Array, required: true } })
const emit = defineEmits(['import'])

const fileInput = ref(null)
const mode = ref('append') // 'append' | 'replace'
const result = ref(null)

function exportCsv() {
  const blob = new Blob([toCsv(props.expenses)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date()
  a.href = url
  a.download = `kakeibo-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function onFile(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  const text = await file.text()
  const { expenses, errors } = fromCsv(text)
  if (mode.value === 'replace' && expenses.length > 0) {
    if (!confirm(`現在の ${props.expenses.length} 件を削除して ${expenses.length} 件に置き換えます。よろしいですか？`)) {
      ev.target.value = ''
      return
    }
  }
  if (expenses.length > 0) emit('import', { expenses, mode: mode.value })
  result.value = { count: expenses.length, errors }
  ev.target.value = ''
}
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body gap-3">
      <h2 class="card-title">データの入出力（CSV）</h2>
      <p class="text-sm text-base-content/60">データはこの端末のブラウザ内にだけ保存されます。バックアップや他の端末への移行は CSV で行ってください。</p>
      <div class="flex flex-wrap items-center gap-3">
        <button class="btn" @click="exportCsv">全データを書き出し</button>
        <div class="divider divider-horizontal m-0"></div>
        <select v-model="mode" class="select select-bordered select-sm">
          <option value="append">既存データに追記</option>
          <option value="replace">既存データを置き換え</option>
        </select>
        <button class="btn" @click="fileInput.click()">CSV を読み込み</button>
        <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="onFile" />
      </div>
      <div v-if="result" class="alert" :class="result.errors.length ? 'alert-warning' : 'alert-success'">
        <div>
          <div>{{ result.count }} 件を読み込みました。</div>
          <ul v-if="result.errors.length" class="text-sm list-disc ml-4">
            <li v-for="e in result.errors.slice(0, 10)" :key="e.line">{{ e.line }} 行目: {{ e.message }}</li>
            <li v-if="result.errors.length > 10">…ほか {{ result.errors.length - 10 }} 件</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
