<template>
  <div class="panel-soft overflow-hidden">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/75">Окно опрыскивания</p>
        <h3 class="mt-2 text-lg font-semibold text-[#342d1e]">{{ result.title }}</h3>
        <p class="mt-2 text-sm leading-relaxed text-[#5F4A2F]/85">{{ result.hint }}</p>
      </div>
      <span class="status-pill shrink-0" :class="statusClass">{{ statusLabel }}</span>
    </div>
    <div class="mt-5 grid gap-2 sm:grid-cols-2">
      <div
        v-for="factor in result.factors"
        :key="factor.name"
        class="flex items-center justify-between rounded-2xl px-4 py-3"
        :class="factor.ok ? 'bg-white/80' : 'bg-rose-50/90'"
      >
        <span class="text-sm text-[#5F4A2F]">{{ factor.name }}</span>
        <span class="text-sm font-semibold" :class="factor.ok ? 'text-emerald-800' : 'text-rose-800'">
          {{ factor.value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { evaluateSprayWindow } from '@/utils/sprayWindow'

const store = useAppStore()
const result = computed(() => evaluateSprayWindow(store.weather))

const statusClass = computed(() => {
  if (result.value.status === 'ok') return 'bg-emerald-100 text-emerald-900'
  if (result.value.status === 'warn') return 'bg-amber-100 text-amber-900'
  return 'bg-rose-100 text-rose-900'
})

const statusLabel = computed(() => {
  if (result.value.status === 'ok') return 'Можно'
  if (result.value.status === 'warn') return 'Осторожно'
  return 'Стоп'
})
</script>
