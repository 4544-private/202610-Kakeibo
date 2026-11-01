<script setup>
import { computed, reactive, ref } from 'vue'
import { PALETTE, LABEL_MAX, colorVar, nextColor, validateLabel } from '../lib/categories.js'
import { useCategories } from '../composables/useCategories.js'
import { useExpenses } from '../composables/useExpenses.js'

const { categories, add, update, remove, move } = useCategories()
const { expenses, reassignCategory } = useExpenses()

const dialog = ref(null)
defineExpose({ open: () => dialog.value?.showModal() })

// カテゴリごとの明細の件数（全期間）
const counts = computed(() => {
  const m = {}
  for (const e of expenses.value) m[e.category] = (m[e.category] ?? 0) + 1
  return m
})

// 編集
const editingId = ref(null)
const draft = reactive({ label: '', hint: '', color: 0 })
const draftError = ref('')
function startEdit(c) {
  deletingId.value = null
  editingId.value = c.id
  Object.assign(draft, { label: c.label, hint: c.hint, color: c.color })
  draftError.value = ''
}
function saveEdit() {
  const err = validateLabel(draft.label, categories.value, editingId.value)
  if (err) return (draftError.value = err)
  update(editingId.value, { label: draft.label.trim(), hint: draft.hint.trim(), color: draft.color })
  editingId.value = null
}

// 削除
const deletingId = ref(null)
const moveTo = ref('')
const others = computed(() => categories.value.filter((c) => c.id !== deletingId.value))
function startDelete(c) {
  editingId.value = null
  deletingId.value = c.id
  moveTo.value = others.value[0]?.id ?? ''
}
function confirmDelete() {
  const id = deletingId.value
  if ((counts.value[id] ?? 0) > 0) {
    if (!moveTo.value) return
    reassignCategory(id, moveTo.value)
  }
  remove(id)
  deletingId.value = null
}

// 追加
const newCat = reactive({ label: '', hint: '', color: nextColor(categories.value) })
const newError = ref('')
function addCategory() {
  const err = validateLabel(newCat.label, categories.value)
  if (err) return (newError.value = err)
  add({ label: newCat.label, hint: newCat.hint.trim(), color: newCat.color })
  Object.assign(newCat, { label: '', hint: '', color: nextColor(categories.value) })
  newError.value = ''
}

function onClose() {
  editingId.value = null
  deletingId.value = null
  newError.value = ''
}
</script>

<template>
  <dialog ref="dialog" class="modal modal-bottom sm:modal-middle" @close="onClose">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold mb-3">カテゴリの編集</h3>

      <ul class="flex flex-col divide-y divide-base-200">
        <li v-for="(c, i) in categories" :key="c.id" class="py-2">
          <!-- 表示 -->
          <div class="flex items-center gap-2">
            <span class="inline-block w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: colorVar(c.color) }"></span>
            <div class="min-w-0 flex-1">
              <div class="truncate">{{ c.label }}</div>
              <div v-if="c.hint" class="text-xs text-base-content/60 truncate">{{ c.hint }}</div>
            </div>
            <span class="text-xs text-base-content/60 whitespace-nowrap tabular-nums">{{ counts[c.id] ?? 0 }} 件</span>
            <div class="join">
              <button class="btn btn-sm join-item" :disabled="i === 0" aria-label="上へ" @click="move(c.id, -1)">↑</button>
              <button class="btn btn-sm join-item" :disabled="i === categories.length - 1" aria-label="下へ" @click="move(c.id, 1)">↓</button>
            </div>
            <button class="btn btn-sm" @click="startEdit(c)">編集</button>
            <button class="btn btn-sm btn-soft btn-error" :disabled="categories.length <= 1" @click="startDelete(c)">削除</button>
          </div>

          <!-- 編集フォーム -->
          <form v-if="editingId === c.id" class="mt-2 p-3 rounded-box bg-base-200 flex flex-col gap-2" @submit.prevent="saveEdit">
            <input v-model="draft.label" class="input input-bordered input-sm w-full" :maxlength="LABEL_MAX" placeholder="名前" aria-label="名前" />
            <input v-model="draft.hint" class="input input-bordered input-sm w-full" placeholder="説明（任意。入力画面に表示）" aria-label="説明" />
            <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="色">
              <button
                v-for="p in PALETTE"
                :key="p.slot"
                type="button"
                class="w-7 h-7 rounded-full border-2"
                :class="draft.color === p.slot ? 'border-base-content' : 'border-transparent'"
                :style="{ backgroundColor: colorVar(p.slot) }"
                :aria-label="p.name"
                :aria-checked="draft.color === p.slot"
                role="radio"
                @click="draft.color = p.slot"
              ></button>
            </div>
            <p v-if="draftError" class="text-sm text-error">{{ draftError }}</p>
            <div class="flex justify-end gap-2">
              <button type="button" class="btn btn-sm" @click="editingId = null">キャンセル</button>
              <button type="submit" class="btn btn-sm btn-primary">保存</button>
            </div>
          </form>

          <!-- 削除の確認 -->
          <div v-if="deletingId === c.id" class="mt-2 p-3 rounded-box bg-base-200 flex flex-col gap-2">
            <template v-if="(counts[c.id] ?? 0) > 0">
              <p class="text-sm">「{{ c.label }}」の明細 {{ counts[c.id] }} 件を、次のカテゴリに移してから削除します。</p>
              <select v-model="moveTo" class="select select-bordered select-sm w-full" aria-label="移動先">
                <option v-for="o in others" :key="o.id" :value="o.id">{{ o.label }}</option>
              </select>
            </template>
            <p v-else class="text-sm">「{{ c.label }}」を削除しますか？（明細はありません）</p>
            <div class="flex justify-end gap-2">
              <button class="btn btn-sm" @click="deletingId = null">キャンセル</button>
              <button class="btn btn-sm btn-error" @click="confirmDelete">{{ (counts[c.id] ?? 0) > 0 ? '移して削除' : '削除' }}</button>
            </div>
          </div>
        </li>
      </ul>

      <!-- 追加 -->
      <form class="mt-4 p-3 rounded-box border border-base-300 flex flex-col gap-2" @submit.prevent="addCategory">
        <h4 class="font-bold text-sm">カテゴリを追加</h4>
        <input v-model="newCat.label" class="input input-bordered input-sm w-full" :maxlength="LABEL_MAX" placeholder="名前（例: 日用品）" aria-label="新しいカテゴリの名前" />
        <input v-model="newCat.hint" class="input input-bordered input-sm w-full" placeholder="説明（任意。入力画面に表示）" aria-label="新しいカテゴリの説明" />
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="色">
          <button
            v-for="p in PALETTE"
            :key="p.slot"
            type="button"
            class="w-7 h-7 rounded-full border-2"
            :class="newCat.color === p.slot ? 'border-base-content' : 'border-transparent'"
            :style="{ backgroundColor: colorVar(p.slot) }"
            :aria-label="p.name"
            :aria-checked="newCat.color === p.slot"
            role="radio"
            @click="newCat.color = p.slot"
          ></button>
        </div>
        <p v-if="newError" class="text-sm text-error">{{ newError }}</p>
        <div class="flex justify-end">
          <button type="submit" class="btn btn-sm btn-primary">追加</button>
        </div>
      </form>

      <div class="modal-action">
        <form method="dialog"><button class="btn">閉じる</button></form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop"><button>閉じる</button></form>
  </dialog>
</template>
