<template>
  <div class="space-y-8">
    <section class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[#342d1e]">История поля</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80">Операции, урожайность и журнал изменений (культура, площадь, контур).</p>
        </div>
        <div class="rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm text-[#5F4A2F]">Выбрано {{ store.selectedField.name }}</div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          @click="activeTab = 'operations'"
          class="rounded-3xl px-4 py-2 text-sm font-semibold"
          :class="activeTab === 'operations' ? 'bg-[#B89B72] text-white' : 'bg-[#F5F1E8] text-[#5F4A2F]'"
        >
          Операции
        </button>
        <button
          type="button"
          @click="openChangelog"
          class="rounded-3xl px-4 py-2 text-sm font-semibold"
          :class="activeTab === 'changelog' ? 'bg-[#B89B72] text-white' : 'bg-[#F5F1E8] text-[#5F4A2F]'"
        >
          Журнал изменений
        </button>
      </div>

      <div v-if="activeTab === 'operations'" class="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div class="rounded-[32px] border border-[#E8DDCB] bg-[#F5F1E8] p-6 shadow-inner">
          <h3 class="text-lg font-semibold text-[#342d1e]">Хронология операций</h3>
          <div class="mt-6 space-y-4">
            <div v-for="item in store.selectedField.history" :key="item.year + item.type" class="rounded-[28px] bg-white p-5 shadow-sm">
              <p class="text-sm uppercase tracking-[0.24em] text-[#8B6F47]/80">{{ item.year }}</p>
              <p class="mt-2 text-base font-semibold text-[#342d1e]">{{ item.type }}</p>
              <p class="mt-1 text-sm text-[#5F4A2F]/80">{{ item.description }}</p>
              <p v-if="item.value" class="mt-2 rounded-3xl bg-[#F5F1E8] px-3 py-2 text-sm text-[#5F4A2F]">{{ item.value }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
          <h3 class="text-lg font-semibold text-[#342d1e]">Урожайность по годам</h3>
          <div class="mt-6 space-y-4">
            <div v-for="point in store.selectedField.yieldHistory" :key="point.year" class="rounded-3xl bg-[#F5F1E8] p-4">
              <div class="flex items-center justify-between text-sm text-[#5F4A2F]">
                <span>{{ point.year }}</span>
                <span class="font-semibold text-[#342d1e]">{{ point.yield }} т/га</span>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div :style="{ width: point.yield * 12 + '%' }" class="h-full rounded-full bg-[#6FCF97]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="mt-6 rounded-[32px] border border-[#E8DDCB] bg-[#F5F1E8] p-6 shadow-inner">
        <h3 class="text-lg font-semibold text-[#342d1e]">Журнал изменений</h3>
        <p v-if="loadingChangelog" class="mt-4 text-sm text-[#5F4A2F]/80">Загрузка…</p>
        <div v-else-if="store.fieldChangelog.length" class="mt-6 space-y-3">
          <div v-for="entry in store.fieldChangelog" :key="entry.id" class="rounded-[24px] bg-white p-4 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-semibold text-[#342d1e]">{{ entry.property }}</p>
              <p class="text-xs text-[#8B6F47]">{{ entry.changedAt }}</p>
            </div>
            <p class="mt-2 text-sm text-[#5F4A2F]/80">{{ entry.userName }} · {{ entry.changeType }}</p>
            <p class="mt-2 text-sm">
              <span class="text-rose-700">{{ entry.oldValue || '—' }}</span>
              →
              <span class="text-emerald-700">{{ entry.newValue || '—' }}</span>
            </p>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-[#5F4A2F]/70">
          {{ store.apiOnline ? 'Изменений пока нет.' : 'Журнал доступен при подключении к серверу.' }}
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const activeTab = ref<'operations' | 'changelog'>('operations')
const loadingChangelog = ref(false)

async function openChangelog() {
  activeTab.value = 'changelog'
  loadingChangelog.value = true
  await store.loadFieldChangelog(store.selectedFieldId)
  loadingChangelog.value = false
}

watch(
  () => store.selectedFieldId,
  () => {
    if (activeTab.value === 'changelog') openChangelog()
  }
)
</script>
