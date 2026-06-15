<template>
  <div class="space-y-8">
    <section class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[#342d1e]">Календарь работ</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80">Посевы, обработки и дедлайны из задач и дат посева полей.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            @click="shiftMonth(-1)"
            class="rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm font-semibold text-[#5F4A2F] transition hover:bg-[#E8DDCB]"
          >
            ←
          </button>
          <span class="min-w-[160px] text-center text-sm font-semibold capitalize text-[#342d1e]">{{ monthTitle }}</span>
          <button
            type="button"
            @click="shiftMonth(1)"
            class="rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm font-semibold text-[#5F4A2F] transition hover:bg-[#E8DDCB]"
          >
            →
          </button>
        </div>
      </div>

      <div class="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="rounded-[32px] border border-[#E8DDCB] bg-[#F5F1E8] p-6 shadow-inner">
          <div class="grid gap-3 md:grid-cols-7">
            <div v-for="weekday in weekdays" :key="weekday" class="text-center text-xs uppercase tracking-[0.28em] text-[#8B6F47]/70">
              {{ weekday }}
            </div>
          </div>
          <div class="mt-4 grid gap-3 md:grid-cols-7">
            <div
              v-for="cell in calendarCells"
              :key="cell.key"
              class="min-h-[110px] rounded-3xl border border-[#E8DDCB] bg-white p-3 text-sm text-[#5F4A2F] shadow-sm"
              :class="cell.inMonth ? '' : 'opacity-40'"
            >
              <div class="flex items-center justify-between">
                <span class="font-semibold text-[#342d1e]">{{ cell.day }}</span>
                <span v-if="cell.inMonth" class="text-xs text-[#8B6F47]/80">{{ cell.monthLabel }}</span>
              </div>
              <div class="mt-2 space-y-1">
                <div
                  v-for="event in cell.events.slice(0, 2)"
                  :key="event.id"
                  class="rounded-2xl px-2 py-1 text-[11px]"
                  :class="eventClass(event.kind)"
                >
                  {{ event.label }}
                </div>
                <p v-if="cell.events.length > 2" class="text-[10px] text-[#8B6F47]">+{{ cell.events.length - 2 }} ещё</p>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
          <h3 class="text-lg font-semibold text-[#342d1e]">События месяца</h3>
          <div class="mt-6 max-h-[520px] space-y-4 overflow-y-auto">
            <div
              v-for="event in monthEvents"
              :key="event.id"
              class="rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-4"
            >
              <p class="text-sm font-semibold text-[#342d1e]">{{ event.label }}</p>
              <p class="mt-2 text-xs text-[#5F4A2F]/80">{{ event.dateLabel }} · {{ event.subtitle }}</p>
              <button
                v-if="event.fieldId"
                type="button"
                class="mt-3 rounded-2xl border border-[#E8DDCB] bg-white px-3 py-1.5 text-xs font-semibold text-[#5F4A2F] transition hover:bg-white/80"
                @click="openOnMap(event.fieldId!)"
              >
                На карте
              </button>
            </div>
            <p v-if="!monthEvents.length" class="text-sm text-[#5F4A2F]/70">В этом месяце событий нет.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()
const viewDate = ref(new Date())
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

type CalendarEvent = {
  id: string
  date: Date
  dateLabel: string
  label: string
  subtitle: string
  kind: 'task' | 'sow' | 'deadline'
  fieldId?: string
}

function parseRuDate(value: string) {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

const allEvents = computed<CalendarEvent[]>(() => {
  const items: CalendarEvent[] = []

  store.fields.forEach((field) => {
    const sow = parseRuDate(field.sowDate)
    if (sow) {
      items.push({
        id: `sow-${field.id}`,
        date: sow,
        dateLabel: field.sowDate,
        label: `Посев ${field.crop}`,
        subtitle: field.name,
        kind: 'sow',
        fieldId: field.id
      })
    }
  })

  store.tasks.forEach((task) => {
    const taskDate = parseRuDate(task.date)
    if (!taskDate) return
    items.push({
      id: `task-${task.id}`,
      date: taskDate,
      dateLabel: task.date,
      label: task.type,
      subtitle: `${task.fieldName} · ${task.status}`,
      kind: task.status === 'Выполнено' ? 'deadline' : 'task',
      fieldId: task.fieldId
    })
  })

  return items.sort((a, b) => a.date.getTime() - b.date.getTime())
})

const monthTitle = computed(() =>
  viewDate.value.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
)

const monthEvents = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  return allEvents.value.filter((event) => event.date.getFullYear() === year && event.date.getMonth() === month)
})

const calendarCells = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = firstDay.toLocaleDateString('ru-RU', { month: 'short' })
  const cells = []

  for (let i = 0; i < 42; i++) {
    const dayNumber = i - startOffset + 1
    const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth
    const cellDate = inMonth ? new Date(year, month, dayNumber) : new Date(year, month + (dayNumber < 1 ? -1 : 1), inMonth ? dayNumber : dayNumber - daysInMonth)
    const events = inMonth
      ? allEvents.value.filter(
          (event) =>
            event.date.getFullYear() === year &&
            event.date.getMonth() === month &&
            event.date.getDate() === dayNumber
        )
      : []

    cells.push({
      key: `${year}-${month}-${i}`,
      day: inMonth ? dayNumber : cellDate.getDate(),
      monthLabel: inMonth ? monthLabel : cellDate.toLocaleDateString('ru-RU', { month: 'short' }),
      inMonth,
      events
    })
  }

  return cells
})

function shiftMonth(delta: number) {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + delta, 1)
}

function eventClass(kind: CalendarEvent['kind']) {
  if (kind === 'sow') return 'bg-amber-100 text-[#5F4A2F]'
  if (kind === 'deadline') return 'bg-emerald-100 text-[#3A5A24]'
  return 'bg-[#F2C94C]/20 text-[#5F4A2F]'
}

function openOnMap(fieldId: string) {
  store.openFieldOnMap(fieldId)
  router.push('/fields')
}
</script>
