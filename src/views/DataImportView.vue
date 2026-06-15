<template>
  <div class="space-y-6 md:space-y-8">
    <section class="rounded-[28px] border border-[#E8DDCB] bg-white/95 p-4 shadow-soft md:rounded-[32px] md:p-6 theme-panel">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[#342d1e] theme-text">Импорт данных</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80 theme-muted">
            JSON, GeoJSON, KML или Shapefile (ZIP). Перед добавлением показывается превью с галочками.
          </p>
          <p v-if="store.apiOnline" class="mt-2 text-xs font-medium text-emerald-700">Сервер подключён — импорт через API.</p>
        </div>
      </div>

      <label
        class="mt-6 block cursor-pointer rounded-[28px] border border-dashed border-[#B89B72] bg-[#F5F1E8]/80 p-8 text-center shadow-inner theme-panel-inner md:p-10"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".json,.geojson,.kml,.zip,.shp,application/json,application/vnd.google-earth.kml+xml"
          class="hidden"
          @change="onFilePick"
        />
        <p class="text-lg font-semibold text-[#342d1e] theme-text">Перетащите файл или нажмите для выбора</p>
        <p class="mt-2 text-sm text-[#5F4A2F]/80 theme-muted">Форматы: JSON, GeoJSON, KML, SHP/ZIP</p>
        <button type="button" @click="fileInput?.click()" class="mt-5 rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8B6F47]">
          Выбрать файл
        </button>
      </label>

      <p v-if="message" :class="ok ? 'text-emerald-700' : 'text-rose-700'" class="mt-4 text-sm font-medium">{{ message }}</p>

      <div v-if="previewOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
          <div class="border-b border-[#E8DDCB] p-5">
            <h3 class="text-lg font-semibold text-[#342d1e]">Превью импорта</h3>
            <p class="mt-1 text-sm text-[#5F4A2F]/80">
              {{ previewMeta.fileName }} · {{ previewMeta.format }} · будет добавлено {{ selectedCount }} из {{ drafts.length }} полей
            </p>
          </div>
          <div class="max-h-[50vh] overflow-y-auto p-5">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="text-xs uppercase tracking-wide text-[#8B6F47]">
                  <th class="pb-3 pr-3">Импорт</th>
                  <th class="pb-3 pr-3">Название</th>
                  <th class="pb-3 pr-3">Культура</th>
                  <th class="pb-3 pr-3">Площадь</th>
                  <th class="pb-3">Посев</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="draft in drafts" :key="draft.tempId" class="border-t border-[#E8DDCB]">
                  <td class="py-3 pr-3">
                    <input v-model="draft.selected" type="checkbox" />
                  </td>
                  <td class="py-3 pr-3 font-medium text-[#342d1e]">{{ draft.name }}</td>
                  <td class="py-3 pr-3">{{ draft.crop }}</td>
                  <td class="py-3 pr-3">{{ draft.area }} га</td>
                  <td class="py-3">{{ draft.sowDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex flex-wrap justify-end gap-3 border-t border-[#E8DDCB] p-5">
            <button type="button" @click="closePreview" class="rounded-3xl px-5 py-3 text-sm font-semibold text-[#5F4A2F] hover:bg-[#F5F1E8]">
              Отмена
            </button>
            <button
              type="button"
              :disabled="selectedCount === 0 || importing"
              @click="confirmPreview"
              class="rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8B6F47] disabled:opacity-50"
            >
              {{ importing ? 'Импорт…' : `Импортировать (${selectedCount})` }}
            </button>
          </div>
        </div>
      </div>

      <div class="mt-8 grid gap-4 rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5 theme-panel-inner">
        <h3 class="text-lg font-semibold text-[#342d1e] theme-text">Последние импорты</h3>
        <div class="space-y-3">
          <div v-for="record in store.importRecords" :key="record.id" class="rounded-[24px] bg-white p-4 shadow-sm theme-input">
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
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import type { ImportDraft } from '@/services/api'

const store = useAppStore()
const fileInput = ref<HTMLInputElement | null>(null)
const message = ref('')
const ok = ref(false)
const previewOpen = ref(false)
const importing = ref(false)
const drafts = ref<(ImportDraft & { selected: boolean })[]>([])
const previewMeta = ref({ fileName: '', format: '' })

const selectedCount = computed(() => drafts.value.filter((item) => item.selected).length)

async function processFile(file: File) {
  message.value = ''
  try {
    if (store.apiOnline) {
      const preview = await store.previewImportFile(file)
      if (preview.drafts.length) {
        previewMeta.value = { fileName: preview.fileName, format: preview.format }
        drafts.value = preview.drafts.map((item) => ({ ...item, selected: item.selected !== false }))
        previewOpen.value = true
        return
      }
    }

    const text = await file.text()
    const parsed = JSON.parse(text)
    const result = store.importFieldsFromJson(parsed, file.name)
    ok.value = result.ok
    message.value = result.message
  } catch (error) {
    ok.value = false
    message.value = error instanceof Error ? error.message : 'Не удалось обработать файл.'
  }
}

async function confirmPreview() {
  importing.value = true
  try {
    const payload = {
      fileName: previewMeta.value.fileName,
      format: previewMeta.value.format,
      drafts: drafts.value.filter((item) => item.selected)
    }
    await store.confirmImport(payload)
    ok.value = true
    message.value = `Импортировано полей: ${payload.drafts.length}`
    closePreview()
  } catch (error) {
    ok.value = false
    message.value = error instanceof Error ? error.message : 'Ошибка импорта'
  } finally {
    importing.value = false
  }
}

function closePreview() {
  previewOpen.value = false
  drafts.value = []
}

function onFilePick(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

function onDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (file) processFile(file)
}
</script>
