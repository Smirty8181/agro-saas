<template>
  <div id="report-root" class="report-screen space-y-8 bg-white p-8 text-[#342d1e]">
    <header class="border-b border-[#E8DDCB] pb-6">
      <p class="text-xs uppercase tracking-[0.3em] text-[#8B6F47]">Agro · отчёт</p>
      <h1 class="mt-2 text-3xl font-bold">Сводный отчёт по хозяйству</h1>
      <p class="mt-2 text-sm text-[#5F4A2F]">{{ companyName }} · {{ reportDate }} · регион {{ store.selectedRegion.name }}</p>
    </header>

    <section>
      <h2 class="text-xl font-semibold">Ключевые показатели</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-[#E8DDCB] p-4">
          <p class="text-xs text-[#8B6F47]">Поля</p>
          <p class="mt-1 text-2xl font-bold">{{ summary.fieldCount }}</p>
        </div>
        <div class="rounded-2xl border border-[#E8DDCB] p-4">
          <p class="text-xs text-[#8B6F47]">Площадь, га</p>
          <p class="mt-1 text-2xl font-bold">{{ summary.totalArea }}</p>
        </div>
        <div class="rounded-2xl border border-[#E8DDCB] p-4">
          <p class="text-xs text-[#8B6F47]">Средняя урожайность</p>
          <p class="mt-1 text-2xl font-bold">{{ summary.avgYield }} т/га</p>
        </div>
        <div class="rounded-2xl border border-[#E8DDCB] p-4">
          <p class="text-xs text-[#8B6F47]">Активные задачи</p>
          <p class="mt-1 text-2xl font-bold">{{ summary.activeTasks }}</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold">Культуры</h2>
      <table class="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-[#E8DDCB] text-left text-xs uppercase text-[#8B6F47]">
            <th class="py-2 pr-4">Культура</th>
            <th class="py-2 pr-4">Полей</th>
            <th class="py-2 pr-4">Площадь, га</th>
            <th class="py-2">Ср. урожайность</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in summary.cropCounts" :key="row.crop" class="border-b border-[#F5F1E8]">
            <td class="py-2 pr-4 font-medium">{{ row.crop }}</td>
            <td class="py-2 pr-4">{{ row.count }}</td>
            <td class="py-2 pr-4">{{ Math.round(row.area) }}</td>
            <td class="py-2">{{ row.avgYield.toFixed(1) }} т/га</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 class="text-xl font-semibold">Риски и рекомендации</h2>
      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 class="text-sm font-semibold text-[#5F4A2F]">Индексы риска</h3>
          <ul class="mt-2 space-y-2 text-sm">
            <li v-for="risk in store.riskIndexes" :key="risk.id">{{ risk.title }}: {{ risk.value }}</li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[#5F4A2F]">Рекомендации</h3>
          <ul class="mt-2 space-y-2 text-sm">
            <li v-for="item in store.recommendations" :key="item.id">{{ item.text }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-xl font-semibold">Погода</h2>
      <p class="mt-2 text-sm">{{ store.weather.station }}</p>
      <p class="mt-1 text-sm">Температура: {{ store.weather.temperature }} · Влажность: {{ store.weather.humidity }} · Ветер: {{ store.weather.wind }}</p>
    </section>

    <footer class="border-t border-[#E8DDCB] pt-4 text-xs text-[#8B6F47]">
      Сформировано пользователем {{ store.currentUser.name }} · Diploom Agro SaaS
    </footer>

    <div class="no-print mt-6 flex gap-3">
      <button type="button" @click="printReport" class="rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8B6F47]">
        Печать / PDF
      </button>
      <RouterLink to="/export" class="rounded-3xl border border-[#E8DDCB] px-5 py-3 text-sm font-semibold text-[#5F4A2F] hover:bg-[#F5F1E8]">
        Назад
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const summary = computed(() => store.analyticsSummary)
const companyName = computed(() => store.settings.companyName || 'Diploom Агрохолдинг')
const reportDate = computed(() => new Date().toLocaleString('ru-RU'))

function printReport() {
  window.print()
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }

  #report-root,
  #report-root * {
    visibility: visible;
  }

  #report-root {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    padding: 12mm;
  }

  .no-print {
    display: none !important;
  }
}
</style>
