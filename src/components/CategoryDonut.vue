<script setup>
import { computed, ref } from 'vue'
import { formatYen } from '../lib/summary.js'

// rows: sumByCategory() の戻り値
const props = defineProps({ rows: { type: Array, required: true } })
const hovered = ref(null)

const R = 80
const r = 48
const C = 100

function polar(angle) {
  const a = (angle - 90) * (Math.PI / 180)
  return [C + Math.cos(a) * R, C + Math.sin(a) * R, C + Math.cos(a) * r, C + Math.sin(a) * r]
}

const totalAmount = computed(() => props.rows.reduce((s, x) => s + x.amount, 0))

const arcs = computed(() => {
  let start = 0
  return props.rows
    .filter((x) => x.amount > 0)
    .map((x) => {
      const sweep = x.share * 360
      const end = start + sweep
      let d
      if (sweep >= 359.999) {
        d = `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C} ${C + R} A ${R} ${R} 0 1 1 ${C} ${C - R} Z M ${C} ${C - r} A ${r} ${r} 0 1 0 ${C} ${C + r} A ${r} ${r} 0 1 0 ${C} ${C - r} Z`
      } else {
        const [x1, y1, ix1, iy1] = polar(start)
        const [x2, y2, ix2, iy2] = polar(end)
        const large = sweep > 180 ? 1 : 0
        d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${r} ${r} 0 ${large} 0 ${ix1} ${iy1} Z`
      }
      start = end
      return { ...x, d }
    })
})

const center = computed(() => {
  const h = props.rows.find((x) => x.id === hovered.value)
  if (h && h.amount > 0) return { title: h.label, value: formatYen(h.amount), sub: `${Math.round(h.share * 100)}%` }
  return { title: '合計', value: formatYen(totalAmount.value), sub: '' }
})
</script>

<template>
  <div class="card bg-base-100 shadow">
    <div class="card-body">
      <h2 class="card-title">カテゴリ別</h2>
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <svg viewBox="0 0 200 200" class="w-48 h-48 shrink-0" role="img" aria-label="カテゴリ別支出の割合">
          <circle v-if="arcs.length === 0" :cx="C" :cy="C" :r="(R + r) / 2" fill="none" :stroke-width="R - r" class="stroke-base-200" />
          <path
            v-for="a in arcs"
            :key="a.id"
            :d="a.d"
            :fill="`var(--cat-${a.id})`"
            fill-rule="evenodd"
            stroke-width="2"
            class="stroke-base-100 transition-opacity cursor-pointer"
            :opacity="hovered && hovered !== a.id ? 0.35 : 1"
            @mouseenter="hovered = a.id"
            @mouseleave="hovered = null"
            @click="hovered = hovered === a.id ? null : a.id"
          >
            <title>{{ a.label }} {{ formatYen(a.amount) }} ({{ Math.round(a.share * 100) }}%)</title>
          </path>
          <text :x="C" :y="C - 8" text-anchor="middle" class="fill-base-content/70 text-[11px]">{{ center.title }}</text>
          <text :x="C" :y="C + 10" text-anchor="middle" class="fill-base-content font-bold text-[15px]">{{ center.value }}</text>
          <text v-if="center.sub" :x="C" :y="C + 26" text-anchor="middle" class="fill-base-content/70 text-[11px]">{{ center.sub }}</text>
        </svg>

        <table class="table table-sm w-full sm:w-auto">
          <tbody>
            <tr
              v-for="x in rows"
              :key="x.id"
              class="cursor-pointer"
              :class="{ 'bg-base-200': hovered === x.id }"
              @mouseenter="hovered = x.id"
              @mouseleave="hovered = null"
            >
              <td><span class="inline-block w-3 h-3 rounded-sm" :style="{ backgroundColor: `var(--cat-${x.id})` }"></span></td>
              <td class="whitespace-nowrap">{{ x.label }}</td>
              <td class="text-right whitespace-nowrap tabular-nums">{{ formatYen(x.amount) }}</td>
              <td class="text-right whitespace-nowrap tabular-nums text-base-content/60">{{ Math.round(x.share * 100) }}%</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-bold">
              <td></td><td>合計</td><td class="text-right tabular-nums">{{ formatYen(totalAmount) }}</td><td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>
