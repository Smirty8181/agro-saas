<template>
  <div class="space-y-8">
    <section class="rounded-[32px] border border-[#E8DDCB] bg-white/95 p-6 shadow-soft">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[#342d1e]">Техника</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80">Управляйте парком машин, контролируйте ТО и статус.</p>
        </div>
        <button class="inline-flex items-center justify-center rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]">Добавить технику</button>
      </div>

      <div class="mt-6 overflow-hidden rounded-[32px] border border-[#E8DDCB] bg-[#F5F1E8]">
        <table class="min-w-full text-left text-sm text-[#5F4A2F]">
          <thead class="bg-white/90 text-[#342d1e]">
            <tr>
              <th class="px-6 py-4">Название</th>
              <th class="px-6 py-4">Тип</th>
              <th class="px-6 py-4">Номер</th>
              <th class="px-6 py-4">Статус</th>
              <th class="px-6 py-4">Последнее ТО</th>
              <th class="px-6 py-4">Следующее ТО</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.equipment" :key="item.id" class="border-t border-[#E8DDCB] hover:bg-[#fff7e8] transition">
              <td class="px-6 py-5 font-semibold text-[#342d1e]">{{ item.name }}</td>
              <td class="px-6 py-5">{{ item.type }}</td>
              <td class="px-6 py-5">{{ item.number }}</td>
              <td class="px-6 py-5"><span :class="statusLabel(item.status)">{{ item.status }}</span></td>
              <td class="px-6 py-5">{{ item.lastService }}</td>
              <td class="px-6 py-5">{{ item.nextService }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
const store = useAppStore()

function statusLabel(status: string) {
  const base = 'inline-flex rounded-full px-3 py-1 text-xs font-semibold'
  if (status === 'Работает') return `${base} bg-emerald-100 text-emerald-800`
  if (status === 'На обслуживании') return `${base} bg-amber-100 text-amber-900`
  return `${base} bg-slate-100 text-slate-700`
}
</script>
