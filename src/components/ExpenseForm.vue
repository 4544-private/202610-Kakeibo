<script setup>
import { reactive, watch, ref } from 'vue'
import { CATEGORIES } from '../lib/categories.js'

const props = defineProps({
  // 編集対象。null なら新規入力モード
  editing: { type: Object, default: null },
  defaultDate: { type: String, required: true },
})
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ date: props.defaultDate, category: CATEGORIES[0].id, amount: '', memo: '' })
const amountInput = ref(null)

watch(
  () => props.editing,
  (e) => {
    if (e) Object.assign(form, { date: e.date, category: e.category, amount: e.amount, memo: e.memo ?? '' })
  },
  { immediate: true },
)

function onSubmit() {
  if (form.amount === '' || Number(form.amount) <= 0) return
  emit('submit', { ...form, amount: Number(form.amount) })
  if (!props.editing) {
    form.amount = ''
    form.memo = ''
    amountInput.value?.focus()
  }
}
</script>

<template>
  <form class="card bg-base-100 shadow" @submit.prevent="onSubmit">
    <div class="card-body gap-3">
      <h2 class="card-title">{{ editing ? '支出を編集' : '支出を入力' }}</h2>

      <label class="form-control">
        <span class="label-text mb-1">日付</span>
        <input v-model="form.date" type="date" class="input input-bordered w-full" required />
      </label>

      <fieldset>
        <legend class="label-text mb-1">カテゴリ</legend>
        <div class="flex flex-wrap gap-2">
          <label v-for="c in CATEGORIES" :key="c.id" class="cursor-pointer" :title="c.hint">
            <input v-model="form.category" type="radio" name="category" :value="c.id" class="hidden peer" />
            <span
              class="badge badge-lg badge-outline peer-checked:text-white peer-checked:border-transparent"
              :style="form.category === c.id ? { backgroundColor: `var(--cat-${c.id})` } : {}"
            >
              <span class="inline-block w-2.5 h-2.5 rounded-full mr-1" :style="{ backgroundColor: `var(--cat-${c.id})` }"></span>
              {{ c.label }}
            </span>
          </label>
        </div>
      </fieldset>

      <label class="form-control">
        <span class="label-text mb-1">金額（円）</span>
        <input ref="amountInput" v-model="form.amount" type="number" inputmode="numeric" min="1" step="1" class="input input-bordered w-full" placeholder="例: 1280" required />
      </label>

      <label class="form-control">
        <span class="label-text mb-1">メモ（任意）</span>
        <input v-model="form.memo" type="text" class="input input-bordered w-full" placeholder="例: 夕飯の材料" />
      </label>

      <div class="card-actions justify-end">
        <button v-if="editing" type="button" class="btn" @click="emit('cancel')">キャンセル</button>
        <button type="submit" class="btn btn-primary">{{ editing ? '更新' : '追加' }}</button>
      </div>
    </div>
  </form>
</template>
