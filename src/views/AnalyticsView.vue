<template>
  <div class="analytics-page page-enter space-y-6 md:space-y-8">
    <section class="rounded-[28px] border border-[#E8DDCB] bg-gradient-to-r from-[#F5F1E8] via-white to-[#F5F1E8] p-5 shadow-soft theme-panel">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.28em] text-[#8B6F47]/80">Live dashboard</p>
          <h2 class="mt-1 text-2xl font-bold text-[#342d1e] theme-text">Аналитика хозяйства</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80 theme-muted">{{ store.fields.length }} полей · {{ store.selectedRegion.name }} · обновлено сейчас</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span v-for="chip in insightChips" :key="chip" class="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#5F4A2F] shadow-sm">{{ chip }}</span>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="(card, index) in statCards"
        :key="card.label"
        class="stat-card-rise overflow-hidden rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel swag-card"
        :style="{ animationDelay: `${index * 0.06}s` }"
      >
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">{{ card.label }}</p>
        <p class="mt-3 text-3xl font-semibold text-[#342d1e] theme-text md:text-4xl">{{ card.value }}</p>
        <p class="mt-2 text-xs font-medium" :class="card.tone">{{ card.hint }}</p>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-3">
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Распределение культур</p>
        <div class="chart-box relative mt-4 h-64 w-full md:h-72"><canvas ref="chartCrop" /></div>
      </div>
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Площадь по культурам, га</p>
        <div class="chart-box relative mt-4 h-64 w-full md:h-72"><canvas ref="chartArea" /></div>
      </div>
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Урожайность по культурам</p>
        <div class="chart-box relative mt-4 h-64 w-full md:h-72"><canvas ref="chartForecast" /></div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Задачи по статусам</p>
        <div class="chart-box relative mt-4 h-72 w-full"><canvas ref="chartTasks" /></div>
      </div>
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Индекс здоровья полей</p>
        <div class="chart-box relative mt-4 h-72 w-full"><canvas ref="chartHealth" /></div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Динамика урожайности по годам</p>
        <div class="chart-box relative mt-4 h-72 w-full"><canvas ref="chartYieldTrend" /></div>
      </div>
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Нагрузка агрономов</p>
        <div class="chart-box relative mt-4 h-72 w-full"><canvas ref="chartAgronomists" /></div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-3">
      <div class="chart-panel swag-card rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Статусы полей</p>
        <div class="chart-box relative mt-4 h-64 w-full"><canvas ref="chartCompletion" /></div>
      </div>

      <div class="rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel swag-card xl:col-span-1">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Риски (live)</p>
        <div class="mt-4 space-y-3">
          <div v-for="risk in store.riskIndexes" :key="risk.id" class="rounded-3xl bg-[#F5F1E8] px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-[#342d1e]">{{ risk.title }}</span>
              <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="risk.color">{{ risk.value }}</span>
            </div>
            <p class="mt-1 text-xs text-[#5F4A2F]/75">{{ risk.hint }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel swag-card xl:col-span-1">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Погода и сезон</p>
        <div class="mt-4 space-y-3 text-sm">
          <div class="rounded-3xl bg-[#F5F1E8] px-4 py-3">
            <p class="text-xs text-[#8B6F47]">Станция</p>
            <p class="mt-1 font-semibold text-[#342d1e]">{{ store.weather.station }}</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-3xl bg-white px-3 py-2 shadow-sm">
              <p class="text-[10px] uppercase text-[#8B6F47]">Темп.</p>
              <p class="font-semibold">{{ store.weather.temperature }}</p>
            </div>
            <div class="rounded-3xl bg-white px-3 py-2 shadow-sm">
              <p class="text-[10px] uppercase text-[#8B6F47]">Осадки 7д</p>
              <p class="font-semibold">{{ weekRain }} мм</p>
            </div>
            <div class="rounded-3xl bg-white px-3 py-2 shadow-sm">
              <p class="text-[10px] uppercase text-[#8B6F47]">Влажность</p>
              <p class="font-semibold">{{ store.weather.humidity }}</p>
            </div>
            <div class="rounded-3xl bg-white px-3 py-2 shadow-sm">
              <p class="text-[10px] uppercase text-[#8B6F47]">Ветер</p>
              <p class="font-semibold">{{ store.weather.wind }}</p>
            </div>
          </div>
          <p v-if="store.weatherError" class="text-xs text-amber-700">{{ store.weatherError }}</p>
        </div>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <div class="rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel swag-card">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Топ полей по площади</p>
        <div class="mt-4 space-y-2">
          <div
            v-for="(field, index) in topFields"
            :key="field.id"
            class="flex items-center justify-between gap-3 rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm theme-panel-inner transition hover:translate-x-1"
          >
            <span class="font-semibold text-[#342d1e] theme-text">
              <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#B89B72] text-xs text-white">{{ index + 1 }}</span>
              №{{ field.number }} · {{ field.name }}
            </span>
            <div class="flex items-center gap-2">
              <span class="text-[#8B6F47]">{{ field.area }} га · {{ field.crop }}</span>
              <button
                type="button"
                class="rounded-2xl border border-[#E8DDCB] bg-white px-3 py-1 text-xs font-semibold text-[#5F4A2F] transition hover:bg-white/90"
                @click="openOnMap(field.id)"
              >
                На карте
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-[28px] border border-[#E8DDCB] bg-white/95 p-5 shadow-soft theme-panel swag-card">
        <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Рекомендации агропомощника</p>
        <ul class="mt-4 space-y-3">
          <li v-for="item in store.recommendations" :key="item.id" class="rounded-3xl border border-[#E8DDCB] bg-[#F5F1E8] px-4 py-3 text-sm text-[#5F4A2F]">
            {{ item.text }}
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { useAppStore } from '@/stores/app'
import { cropStyles } from '@/utils/cropStyles'

const store = useAppStore()
const router = useRouter()
const chartCrop = ref<HTMLCanvasElement | null>(null)
const chartArea = ref<HTMLCanvasElement | null>(null)
const chartForecast = ref<HTMLCanvasElement | null>(null)
const chartCompletion = ref<HTMLCanvasElement | null>(null)
const chartTasks = ref<HTMLCanvasElement | null>(null)
const chartHealth = ref<HTMLCanvasElement | null>(null)
const chartYieldTrend = ref<HTMLCanvasElement | null>(null)
const chartAgronomists = ref<HTMLCanvasElement | null>(null)
const charts: Chart[] = []

const summary = computed(() => store.analyticsSummary)
const topFields = computed(() => [...store.fields].sort((a, b) => b.area - a.area).slice(0, 6))
const weekRain = computed(() => store.weather.metrics?.weekRain?.toFixed(1) ?? '—')

const attentionFields = computed(() => store.fields.filter((f) => f.status === 'Внимание').length)
const lowHealthFields = computed(() => store.fields.filter((f) => f.healthIndex < 70).length)
const doneTasks = computed(() => store.tasks.filter((t) => t.status === 'Выполнено').length)

function openOnMap(fieldId: string) {
  store.openFieldOnMap(fieldId)
  router.push('/fields')
}

const statCards = computed(() => [
  {
    label: 'Всего полей',
    value: String(summary.value.fieldCount),
    hint: `${store.fieldCropOptions.length} культур в ротации`,
    tone: 'text-[#8B6F47]'
  },
  {
    label: 'Общая площадь',
    value: `${summary.value.totalArea.toLocaleString('ru-RU')} га`,
    hint: `~${Math.round(summary.value.totalArea / Math.max(1, summary.value.fieldCount))} га на поле`,
    tone: 'text-[#8B6F47]'
  },
  {
    label: 'Активных задач',
    value: String(summary.value.activeTasks),
    hint: `${doneTasks.value} выполнено · ${attentionFields.value} полей «Внимание»`,
    tone: summary.value.activeTasks > 20 ? 'text-amber-700' : 'text-emerald-700'
  },
  {
    label: 'Средняя урожайность',
    value: `${summary.value.avgYield} т/га`,
    hint: lowHealthFields.value ? `${lowHealthFields.value} полей с индексом < 70` : 'Индекс здоровья стабильный',
    tone: lowHealthFields.value ? 'text-amber-700' : 'text-emerald-700'
  }
])

const insightChips = computed(() => {
  const chips = [`${summary.value.activeTasks} задач в работе`]
  if (attentionFields.value) chips.push(`${attentionFields.value} полей требуют внимания`)
  if (store.weather.metrics?.tomorrowRain && store.weather.metrics.tomorrowRain >= 3) {
    chips.push(`Завтра ${store.weather.metrics.tomorrowRain.toFixed(1)} мм дождя`)
  }
  return chips.slice(0, 4)
})

const taskStats = computed(() => {
  const statuses = ['Выполнено', 'В работе', 'Запланировано']
  return statuses.map((status) => ({
    status,
    count: store.tasks.filter((t) => t.status === status).length
  }))
})

const healthBuckets = computed(() => {
  const buckets = [
    { label: '< 60', min: 0, max: 59 },
    { label: '60–69', min: 60, max: 69 },
    { label: '70–79', min: 70, max: 79 },
    { label: '80+', min: 80, max: 100 }
  ]
  return buckets.map((b) => ({
    label: b.label,
    count: store.fields.filter((f) => f.healthIndex >= b.min && f.healthIndex <= b.max).length
  }))
})

const yieldTrend = computed(() => {
  const map = new Map<number, { sum: number; count: number }>()
  store.fields.forEach((field) => {
    field.yieldHistory.forEach((point) => {
      const bucket = map.get(point.year) ?? { sum: 0, count: 0 }
      bucket.sum += point.yield
      bucket.count += 1
      map.set(point.year, bucket)
    })
  })
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, data]) => ({ year, avg: Number((data.sum / data.count).toFixed(1)) }))
})

const agronomistStats = computed(() => {
  const map = new Map<string, number>()
  store.fields.forEach((field) => {
    map.set(field.agronomist, (map.get(field.agronomist) ?? 0) + 1)
  })
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))
})

function destroyCharts() {
  charts.splice(0).forEach((chart) => chart.destroy())
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450 },
  plugins: { legend: { labels: { boxWidth: 12, font: { size: 11 } } } }
}

function createCharts() {
  destroyCharts()
  const crops = summary.value.cropCounts
  const labels = crops.map((item) => item.crop)
  const colors = labels.map((crop) => cropStyles[crop as keyof typeof cropStyles]?.fill ?? '#B89B72')

  if (chartCrop.value) {
    charts.push(
      new Chart(chartCrop.value, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: crops.map((i) => i.count), backgroundColor: colors, borderWidth: 0 }] },
        options: { ...chartOptions, plugins: { legend: { position: 'bottom' } } }
      })
    )
  }

  if (chartArea.value) {
    charts.push(
      new Chart(chartArea.value, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Га', data: crops.map((i) => i.area), backgroundColor: colors, borderRadius: 8 }] },
        options: {
          ...chartOptions,
          scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
          plugins: { legend: { display: false } }
        }
      })
    )
  }

  if (chartForecast.value) {
    charts.push(
      new Chart(chartForecast.value, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'т/га',
            data: crops.map((i) => Number(i.avgYield.toFixed(1))),
            borderColor: '#B89B72',
            backgroundColor: 'rgba(184,155,114,0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 5
          }]
        },
        options: {
          ...chartOptions,
          scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
          plugins: { legend: { display: false } }
        }
      })
    )
  }

  if (chartTasks.value) {
    charts.push(
      new Chart(chartTasks.value, {
        type: 'polarArea',
        data: {
          labels: taskStats.value.map((i) => i.status),
          datasets: [{
            data: taskStats.value.map((i) => i.count),
            backgroundColor: ['#6FCF97', '#F2C94C', '#B89B72']
          }]
        },
        options: { ...chartOptions, plugins: { legend: { position: 'bottom' } } }
      })
    )
  }

  if (chartHealth.value) {
    charts.push(
      new Chart(chartHealth.value, {
        type: 'bar',
        data: {
          labels: healthBuckets.value.map((i) => i.label),
          datasets: [{ data: healthBuckets.value.map((i) => i.count), backgroundColor: '#6FCF97', borderRadius: 8 }]
        },
        options: {
          ...chartOptions,
          indexAxis: 'y',
          scales: { x: { beginAtZero: true } },
          plugins: { legend: { display: false } }
        }
      })
    )
  }

  if (chartYieldTrend.value && yieldTrend.value.length) {
    charts.push(
      new Chart(chartYieldTrend.value, {
        type: 'line',
        data: {
          labels: yieldTrend.value.map((i) => String(i.year)),
          datasets: [{
            label: 'Ср. урожайность',
            data: yieldTrend.value.map((i) => i.avg),
            borderColor: '#8B6F47',
            backgroundColor: 'rgba(139,111,71,0.12)',
            fill: true,
            tension: 0.3
          }]
        },
        options: { ...chartOptions, plugins: { legend: { display: false } } }
      })
    )
  }

  if (chartAgronomists.value) {
    charts.push(
      new Chart(chartAgronomists.value, {
        type: 'bar',
        data: {
          labels: agronomistStats.value.map((i) => i.name.split(' ')[0]),
          datasets: [{ data: agronomistStats.value.map((i) => i.count), backgroundColor: '#F2994A', borderRadius: 8 }]
        },
        options: {
          ...chartOptions,
          indexAxis: 'y',
          scales: { x: { beginAtZero: true } },
          plugins: { legend: { display: false } }
        }
      })
    )
  }

  if (chartCompletion.value) {
    const statuses = store.fieldStatusOptions
    charts.push(
      new Chart(chartCompletion.value, {
        type: 'doughnut',
        data: {
          labels: statuses,
          datasets: [{
            data: statuses.map((status) => store.fields.filter((field) => field.status === status).length),
            backgroundColor: ['#6FCF97', '#F2C94C', '#B89B72']
          }]
        },
        options: { ...chartOptions, plugins: { legend: { position: 'bottom' } } }
      })
    )
  }
}

let resizeTimer = 0
function scheduleRefresh() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(createCharts, 120)
}

onMounted(() => {
  createCharts()
  window.addEventListener('resize', scheduleRefresh)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', scheduleRefresh)
  destroyCharts()
})

watch(() => store.fields.length, scheduleRefresh)
watch(() => store.tasks.length, scheduleRefresh)
watch(() => summary.value.cropCounts.length, scheduleRefresh)
</script>

<style scoped>
.chart-box {
  overflow: hidden;
  min-height: 0;
}

.chart-box :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
