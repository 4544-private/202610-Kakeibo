import { ref, watch } from 'vue'
import { loadCategories, saveCategories } from '../lib/storage.js'
import { createCategory } from '../lib/categories.js'

// アプリ全体で 1 つのカテゴリ一覧を共有する
const categories = ref(loadCategories())
watch(categories, (v) => saveCategories(v), { deep: true })

export function useCategories() {
  function add(data) {
    const c = createCategory(data, categories.value)
    categories.value.push(c)
    return c
  }
  function update(id, patch) {
    const i = categories.value.findIndex((c) => c.id === id)
    if (i >= 0) categories.value[i] = { ...categories.value[i], ...patch, id }
  }
  function remove(id) {
    if (categories.value.length <= 1) return
    categories.value = categories.value.filter((c) => c.id !== id)
  }
  // delta: -1 で上へ、+1 で下へ
  function move(id, delta) {
    const list = [...categories.value]
    const i = list.findIndex((c) => c.id === id)
    const j = i + delta
    if (i < 0 || j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j], list[i]]
    categories.value = list
  }
  function appendAll(list) {
    if (list.length > 0) categories.value = [...categories.value, ...list]
  }
  return { categories, add, update, remove, move, appendAll }
}
