<template>
  <div class="space-y-8">
    <section class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[#342d1e]">Задания по полям</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80">Управляйте текущими и запланированными работами на агроплощадках.</p>
          <p class="mt-2 text-xs text-[#8B6F47]/80">Закрытие задачи — только с GPS внутри контура поля.</p>
        </div>
        <button v-if="store.can('tasks.create')" class="inline-flex items-center justify-center rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]">Создать задание</button>
      </div>

      <div class="mt-6 overflow-hidden rounded-[32px] border border-[#E8DDCB] bg-[#F5F1E8]">
        <table class="min-w-full text-left text-sm text-[#5F4A2F]">
          <thead class="bg-white/90 text-[#342d1e]">
            <tr>
              <th class="px-6 py-4">ID</th>
              <th class="px-6 py-4">Поле</th>
              <th class="px-6 py-4">Исполнитель</th>
              <th class="px-6 py-4">Тип работы</th>
              <th class="px-6 py-4">Дата</th>
              <th class="px-6 py-4">Приоритет</th>
              <th class="px-6 py-4">Статус</th>
              <th class="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in store.tasks" :key="task.id" @click="store.selectTask(task.id)" class="cursor-pointer border-t border-[#E8DDCB] transition hover:bg-[#fff7e8]">
              <td class="px-6 py-5 font-semibold text-[#5F4A2F]">{{ task.id }}</td>
              <td class="px-6 py-5">{{ task.fieldName }}</td>
              <td class="px-6 py-5">{{ task.assignee }}</td>
              <td class="px-6 py-5">{{ task.type }}</td>
              <td class="px-6 py-5">{{ task.date }}</td>
              <td class="px-6 py-5">{{ task.priority }}</td>
              <td class="px-6 py-5"><span :class="statusLabel(task.status)">{{ task.status }}</span></td>
              <td class="px-6 py-5">
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded-2xl border border-[#E8DDCB] bg-white px-3 py-1.5 text-xs font-semibold text-[#5F4A2F] transition hover:bg-[#F5F1E8]"
                    @click.stop="openOnMap(task.fieldId)"
                  >
                    На карте
                  </button>
                  <button
                    v-if="task.status !== 'Выполнено' && store.can('tasks.complete')"
                    type="button"
                    class="rounded-2xl bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                    :disabled="completingId === task.id"
                    @click.stop="completeOnField(task.id)"
                  >
                    {{ completingId === task.id ? 'GPS…' : 'Выполнено' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
        <h2 class="text-lg font-semibold text-[#342d1e]">Статистика задач</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard title="Выполнено" :value="String(doneCount)" />
          <SummaryCard title="В работе" :value="String(inProgressCount)" />
          <SummaryCard title="Запланировано" :value="String(plannedCount)" />
        </div>
        <div class="mt-8 grid gap-4 md:grid-cols-2">
          <div class="rounded-[28px] bg-[#F5F1E8] p-5">
            <p class="text-sm text-[#5F4A2F]/80">Самые частые работы</p>
            <p class="mt-3 text-xl font-semibold text-[#342d1e]">Обработка, Удобрения</p>
          </div>
          <div class="rounded-[28px] bg-[#F5F1E8] p-5">
            <p class="text-sm text-[#5F4A2F]/80">Средняя продолжительность</p>
            <p class="mt-3 text-xl font-semibold text-[#342d1e]">3.2 дня</p>
          </div>
        </div>
      </div>
      <div class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
        <h2 class="text-lg font-semibold text-[#342d1e]">Карточка задачи</h2>
        <div class="mt-6 space-y-4 rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5">
          <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">Выбранная задача</p>
          <p class="mt-2 text-xl font-semibold text-[#342d1e]">{{ store.selectedTask.type }} на {{ store.selectedTask.fieldName }}</p>
          <div class="space-y-3 text-sm text-[#5F4A2F]">
            <SummaryRow label="ID" :value="store.selectedTask.id" />
            <SummaryRow label="Исполнитель" :value="store.selectedTask.assignee" />
            <SummaryRow label="Дата" :value="store.selectedTask.date" />
            <SummaryRow label="Приоритет" :value="store.selectedTask.priority" />
            <SummaryRow label="Статус" :value="store.selectedTask.status" />
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              class="btn-primary"
              @click="openOnMap(store.selectedTask.fieldId)"
            >
              На карте
            </button>
            <button
              v-if="store.selectedTask.status !== 'Выполнено' && store.can('tasks.complete')"
              type="button"
              class="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              :disabled="completingId === store.selectedTask.id"
              @click="completeOnField(store.selectedTask.id)"
            >
              {{ completingId === store.selectedTask.id ? 'Проверка GPS…' : 'Выполнено на поле' }}
            </button>
          </div>
          <p class="mt-3 text-xs text-[#8B6F47]/80">
            Маршрут:
            <button type="button" class="ml-1 font-semibold underline-offset-2 hover:underline" @click="openRoute('yandex-nav')">Навигатор</button>
            ·
            <button type="button" class="font-semibold underline-offset-2 hover:underline" @click="openRoute('yandex-maps')">Карты</button>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { fieldDestination, openFieldNavigation, type NavigationProvider } from '@/utils/navigation'
const store = useAppStore()
const router = useRouter()
const completingId = ref('')

function openOnMap(fieldId: string) {
  store.openFieldOnMap(fieldId)
  router.push('/fields')
}

async function completeOnField(taskId: string) {
  completingId.value = taskId
  await store.completeTask(taskId)
  completingId.value = ''
}

function openRoute(provider: NavigationProvider) {
  const field = store.fields.find((item) => item.id === store.selectedTask.fieldId)
  if (!field) return
  const dest = fieldDestination(field)
  if (!dest) return
  openFieldNavigation(provider, dest.lat, dest.lng)
}

const doneCount = computed(() => store.tasks.filter((item) => item.status === 'Выполнено').length)
const inProgressCount = computed(() => store.tasks.filter((item) => item.status === 'В работе').length)
const plannedCount = computed(() => store.tasks.filter((item) => item.status === 'Запланировано').length)

function statusLabel(status: string) {
  const base = 'inline-flex rounded-full px-3 py-1 text-xs font-semibold'
  switch (status) {
    case 'Выполнено':
      return `${base} bg-emerald-100 text-emerald-800`
    case 'В работе':
      return `${base} bg-amber-100 text-amber-900`
    default:
      return `${base} bg-slate-100 text-slate-800`
  }
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    SummaryCard: {
      props: ['title', 'value'],
      template: '<div class="rounded-[28px] bg-[#F5F1E8] p-5 text-sm text-[#5F4A2F] shadow-sm"><p class="text-sm text-[#8B6F47]/80">{{ title }}</p><p class="mt-3 text-3xl font-semibold text-[#342d1e]">{{ value }}</p></div>'
    },
    SummaryRow: {
      props: ['label', 'value'],
      template: '<div class="flex items-center justify-between text-sm text-[#5F4A2F]"><span>{{ label }}</span><span class="font-semibold text-[#342d1e]">{{ value }}</span></div>'
    }
  }
})
</script>
