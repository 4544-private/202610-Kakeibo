<script setup>
import { categoryLabel } from '../lib/categories.js'
import { formatYen } from '../lib/summary.js'

defineProps({ expenses: { type: Array, required: true } })
const emit = defineEmits(['edit', 'remove'])

const day = (d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title">明細</h2>
      <p v-if="expenses.length === 0" class="text-base-content/60">この月の支出はまだありません。</p>
      <div v-else class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr><th>日付</th><th>カテゴリ</th><th class="text-right">金額</th><th>メモ</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="e in expenses" :key="e.id">
              <td class="whitespace-nowrap">{{ day(e.date) }}</td>
              <td class="whitespace-nowrap">
                <span class="inline-block w-2.5 h-2.5 rounded-full mr-1 align-middle" :style="{ backgroundColor: `var(--cat-${e.category})` }"></span>{{ categoryLabel(e.category) }}
              </td>
              <td class="text-right whitespace-nowrap tabular-nums">{{ formatYen(e.amount) }}</td>
              <td class="max-w-48 truncate">{{ e.memo }}</td>
              <td class="whitespace-nowrap text-right">
                <button class="btn btn-xs" @click="emit('edit', e)">編集</button>
                <button class="btn btn-xs btn-soft btn-error" @click="emit('remove', e)">削除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
