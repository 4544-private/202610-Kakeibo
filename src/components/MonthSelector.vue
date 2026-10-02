<script setup>
const props = defineProps({ modelValue: { type: String, required: true } }) // 'YYYY-MM'
const emit = defineEmits(['update:modelValue'])

function shift(delta) {
  const [y, m] = props.modelValue.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  emit('update:modelValue', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
}
const label = (v) => `${v.slice(0, 4)}年${Number(v.slice(5, 7))}月`
</script>

<template>
  <div class="join">
    <button class="btn join-item" aria-label="前の月" @click="shift(-1)">‹</button>
    <span class="btn join-item no-animation pointer-events-none text-lg font-bold w-36">{{ label(modelValue) }}</span>
    <button class="btn join-item" aria-label="次の月" @click="shift(1)">›</button>
  </div>
</template>
