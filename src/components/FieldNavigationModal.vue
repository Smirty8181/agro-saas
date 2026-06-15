<template>
  <div class="fixed inset-0 z-[99998] flex items-end justify-center bg-[#342d1e]/55 p-4 backdrop-blur-sm sm:items-center" @click.self="close">
    <div class="w-full max-w-lg overflow-hidden rounded-[32px] border border-[#E8DDCB] bg-white shadow-2xl">
      <div class="bg-gradient-to-br from-[#3A5A24] via-[#4A6B32] to-[#8B6F47] px-6 py-5 text-white">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-white/70">Маршрут к полю</p>
            <h3 class="mt-2 text-2xl font-semibold">Поле №{{ field.number }}</h3>
            <p class="mt-1 text-sm text-white/85">{{ field.name }} · {{ field.crop }} · {{ field.area }} га</p>
          </div>
          <button
            type="button"
            class="rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/25"
            @click="close"
          >
            Закрыть
          </button>
        </div>
      </div>

      <div class="space-y-5 px-6 py-5">
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-3xl bg-[#F5F1E8] p-4 text-center">
            <p class="text-[10px] uppercase tracking-[0.2em] text-[#8B6F47]/80">Расстояние</p>
            <p class="mt-2 text-lg font-semibold text-[#342d1e]">{{ distanceLabel }}</p>
          </div>
          <div class="rounded-3xl bg-[#F5F1E8] p-4 text-center">
            <p class="text-[10px] uppercase tracking-[0.2em] text-[#8B6F47]/80">В пути ~</p>
            <p class="mt-2 text-lg font-semibold text-[#342d1e]">{{ etaLabel }}</p>
          </div>
          <div class="rounded-3xl bg-[#F5F1E8] p-4 text-center">
            <p class="text-[10px] uppercase tracking-[0.2em] text-[#8B6F47]/80">Координаты</p>
            <p class="mt-2 text-xs font-semibold tabular-nums text-[#342d1e]">{{ coordsLabel }}</p>
          </div>
        </div>

        <p v-if="geoError" class="rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{{ geoError }}</p>
        <p v-if="copyMessage" class="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{{ copyMessage }}</p>

        <div class="space-y-3">
          <button
            v-for="option in navigationOptions"
            :key="option.id"
            type="button"
            class="flex w-full items-center gap-4 rounded-[28px] border border-[#E8DDCB] bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
            @click="launch(option.id)"
          >
            <span
              class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
              :style="{ background: option.accent }"
            >
              {{ option.title.charAt(0) }}
            </span>
            <span>
              <span class="block text-sm font-semibold text-[#342d1e]">{{ option.title }}</span>
              <span class="mt-1 block text-xs text-[#5F4A2F]/80">{{ option.subtitle }}</span>
            </span>
          </button>
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="rounded-3xl border border-[#E8DDCB] bg-[#F5F1E8] px-4 py-3 text-sm font-semibold text-[#5F4A2F] transition hover:bg-[#E8DDCB]"
            @click="copyCoords"
          >
            Скопировать координаты
          </button>
          <button
            type="button"
            class="rounded-3xl bg-[#B89B72] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]"
            @click="openOnMap"
          >
            Показать на карте
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Field } from '@/data/mockData'
import { haversineDistance } from '@/utils/geo'
import {
  copyFieldCoordinates,
  estimateDriveMinutes,
  fieldDestination,
  formatCoordinates,
  formatDistanceKm,
  navigationOptions,
  openFieldNavigation,
  type NavigationProvider
} from '@/utils/navigation'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ field: Field }>()
const emit = defineEmits<{ close: [] }>()

const store = useAppStore()
const router = useRouter()
const userPosition = ref<[number, number] | null>(null)
const geoError = ref('')
const copyMessage = ref('')

const destination = computed(() => fieldDestination(props.field))

const distanceLabel = computed(() => {
  if (!destination.value || !userPosition.value) return '—'
  const meters = haversineDistance(userPosition.value, [destination.value.lat, destination.value.lng])
  return formatDistanceKm(meters)
})

const etaLabel = computed(() => {
  if (!destination.value || !userPosition.value) return '—'
  const meters = haversineDistance(userPosition.value, [destination.value.lat, destination.value.lng])
  return `~${estimateDriveMinutes(meters)} мин`
})

const coordsLabel = computed(() => {
  if (!destination.value) return '—'
  return formatCoordinates(destination.value.lat, destination.value.lng)
})

onMounted(() => {
  if (!navigator.geolocation) {
    geoError.value = 'Геолокация недоступна — расстояние можно оценить после разрешения GPS на телефоне.'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userPosition.value = [position.coords.latitude, position.coords.longitude]
      geoError.value = ''
    },
    () => {
      geoError.value = 'Разрешите доступ к геолокации, чтобы видеть расстояние до поля.'
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
  )
})

function close() {
  emit('close')
}

function launch(provider: NavigationProvider) {
  if (!destination.value) return
  openFieldNavigation(provider, destination.value.lat, destination.value.lng)
}

async function copyCoords() {
  if (!destination.value) return
  await copyFieldCoordinates(destination.value.lat, destination.value.lng)
  copyMessage.value = 'Координаты скопированы — можно отправить бригаде в мессенджере.'
  window.setTimeout(() => {
    copyMessage.value = ''
  }, 2600)
}

function openOnMap() {
  store.openFieldOnMap(props.field.id)
  close()
  if (router.currentRoute.value.path !== '/fields') {
    router.push('/fields')
  }
}
</script>
