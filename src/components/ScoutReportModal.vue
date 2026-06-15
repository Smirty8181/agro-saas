<template>
  <div class="fixed inset-0 z-[99999] flex items-end justify-center bg-[#342d1e]/45 p-4 backdrop-blur-sm sm:items-center" @click.self="emit('close')">
    <div class="w-full max-w-md rounded-[28px] border border-[#E8DDCB] bg-white p-6 shadow-2xl">
      <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/75">Обход поля</p>
      <h3 class="mt-2 text-xl font-semibold text-[#342d1e]">{{ fieldName }}</h3>
      <p class="mt-1 text-xs text-[#5F4A2F]/75">GPS: {{ lat.toFixed(5) }}, {{ lng.toFixed(5) }}</p>

      <div class="mt-5 grid grid-cols-3 gap-2">
        <button
          v-for="kind in kinds"
          :key="kind.id"
          type="button"
          class="rounded-2xl border px-3 py-3 text-center text-xs font-semibold transition"
          :class="selectedKind === kind.id ? 'border-[#8B6F47] bg-[#F5F1E8] text-[#342d1e]' : 'border-[#E8DDCB] bg-white text-[#5F4A2F]'"
          @click="selectedKind = kind.id"
        >
          <span class="block text-lg">{{ kind.icon }}</span>
          {{ kind.label }}
        </button>
      </div>

      <label class="mt-5 block">
        <span class="text-sm font-semibold text-[#5F4A2F]">Комментарий</span>
        <textarea
          v-model="comment"
          rows="3"
          placeholder="Где заметили, масштаб, рекомендации..."
          class="mt-2 w-full rounded-2xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm outline-none focus:border-amber-300"
        />
      </label>

      <label class="mt-4 block">
        <span class="text-sm font-semibold text-[#5F4A2F]">Фото с телефона</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          class="mt-2 block w-full text-sm text-[#5F4A2F]"
          @change="onPhotoChange"
        />
      </label>

      <div v-if="photoPreview" class="mt-3 overflow-hidden rounded-2xl border border-[#E8DDCB]">
        <img :src="photoPreview" alt="Фото обхода" class="max-h-40 w-full object-cover" />
      </div>

      <div class="mt-6 flex gap-2">
        <button type="button" class="btn-ghost flex-1" @click="emit('close')">Отмена</button>
        <button type="button" class="btn-primary flex-1" :disabled="saving" @click="save">
          {{ saving ? 'Сохранение…' : 'Сохранить метку' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ScoutKind } from '@/data/mockData'
import { useAppStore } from '@/stores/app'

const props = defineProps<{
  fieldId: string
  fieldName: string
  lat: number
  lng: number
}>()

const emit = defineEmits<{ close: [] }>()
const store = useAppStore()

const kinds = [
  { id: 'weed' as ScoutKind, label: 'Сорняк', icon: '🌿' },
  { id: 'pest' as ScoutKind, label: 'Вредитель', icon: '🐛' },
  { id: 'disease' as ScoutKind, label: 'Болезнь', icon: '🍂' }
]

const selectedKind = ref<ScoutKind>('weed')
const comment = ref('')
const photoPreview = ref('')
const photoDataUrl = ref<string | undefined>()
const saving = ref(false)

function onPhotoChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const result = String(reader.result ?? '')
    photoPreview.value = result
    photoDataUrl.value = result.length < 900_000 ? result : undefined
  }
  reader.readAsDataURL(file)
}

async function save() {
  saving.value = true
  await store.addScoutReport({
    fieldId: props.fieldId,
    lat: props.lat,
    lng: props.lng,
    kind: selectedKind.value,
    comment: comment.value.trim() || 'Без комментария',
    photoDataUrl: photoDataUrl.value
  })
  saving.value = false
  emit('close')
}
</script>
