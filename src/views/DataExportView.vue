<template>
  <div class="space-y-6 md:space-y-8">
    <section class="rounded-[28px] border border-[#E8DDCB] bg-white/95 p-4 shadow-soft md:rounded-[32px] md:p-6 theme-panel">
      <div>
        <h2 class="text-xl font-semibold text-[#342d1e] theme-text">Экспорт данных</h2>
        <p class="mt-2 text-sm text-[#5F4A2F]/80 theme-muted">Скачайте актуальные поля в JSON, CSV или GeoJSON для отчётов и GIS.</p>
      </div>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          v-for="item in formats"
          :key="item.id"
          @click="exportData(item.id)"
          class="rounded-[28px] border border-[#E8DDCB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md theme-input"
        >
          <p class="text-lg font-semibold text-[#342d1e] theme-text">{{ item.title }}</p>
          <p class="mt-3 text-sm text-[#5F4A2F]/80 theme-muted">{{ item.description }}</p>
          <span class="mt-5 inline-flex rounded-3xl bg-[#B89B72] px-4 py-2 text-sm font-semibold text-white">Скачать</span>
        </button>

        <RouterLink
          to="/export/report"
          class="rounded-[28px] border border-[#E8DDCB] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md theme-input"
        >
          <p class="text-lg font-semibold text-[#342d1e] theme-text">PDF-отчёт</p>
          <p class="mt-3 text-sm text-[#5F4A2F]/80 theme-muted">Печать сводки через браузер (Ctrl+P → «Сохранить как PDF»)</p>
          <span class="mt-5 inline-flex rounded-3xl bg-[#6FCF97] px-4 py-2 text-sm font-semibold text-white">Открыть отчёт</span>
        </RouterLink>
      </div>

      <div class="mt-8 rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5 theme-panel-inner">
        <h3 class="text-lg font-semibold text-[#342d1e] theme-text">История экспортов</h3>
        <div class="mt-5 space-y-3">
          <div v-for="record in store.exportRecords" :key="record.id" class="rounded-[24px] bg-white p-4 shadow-sm theme-input">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-[#342d1e] theme-text">{{ record.file }}</p>
                <p class="text-xs text-[#5F4A2F]/80 theme-muted">{{ record.format }} · {{ record.date }}</p>
              </div>
              <span class="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">{{ record.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const formats = [
  { id: 'json' as const, title: 'JSON', description: 'Полный дамп полей для резервной копии' },
  { id: 'csv' as const, title: 'CSV', description: 'Таблица для Excel и отчётности' },
  { id: 'geojson' as const, title: 'GeoJSON', description: 'Геометрия полей для GIS-систем' }
]

function exportData(format: 'json' | 'csv' | 'geojson') {
  store.exportFields(format)
}
</script>
