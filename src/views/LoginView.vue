<template>
  <div class="login-page relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2" :class="{ 'login-page--golden': goldenMode }">
    <MatrixRain v-if="matrixMode" class="absolute inset-0 z-[1]" />

    <section class="login-hero relative overflow-hidden px-8 py-12 lg:px-14 lg:py-16">
      <div class="login-hero-bg absolute inset-0"></div>
      <div class="grain-field absolute inset-0 opacity-30"></div>

      <div v-for="n in 18" :key="n" class="floating-seed" :style="seedStyle(n)"></div>

      <div class="relative z-10 flex h-full flex-col justify-between">
        <div>
          <button
            type="button"
            class="badge-agro inline-flex items-center gap-2 rounded-full border border-[#B89B72]/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#5F4A2F] transition hover:scale-105"
            @click="onBadgeClick"
          >
            <img src="/logo.png" alt="Agro" class="h-7 w-7 rounded-full object-cover" />
            Agro
          </button>
          <p v-if="secretMessage" class="mt-3 animate-fade-in text-sm font-semibold text-[#6FCF97]">{{ secretMessage }}</p>
          <h1 class="login-title mt-10 max-w-xl text-4xl font-bold leading-tight text-[#342d1e]">
            Платформа управления сельскохозяйственными угодьями
          </h1>
          <p class="mt-6 max-w-xl text-base leading-8 text-[#5F4A2F]/90">
            Поля, техника, погода и агротехнологии — в одном месте. Иногда даже Тетрис.
          </p>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div class="login-card-rise rounded-[32px] bg-white/90 shadow-soft backdrop-blur-sm" style="animation-delay: 0.1s">
            <div class="relative overflow-hidden rounded-[32px] border border-white/80">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
                alt="Поле с трактором"
                class="h-72 w-full object-cover object-center transition duration-700 hover:scale-105"
              />
              <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
                <p class="text-xs uppercase tracking-[0.32em]">Полевые работы</p>
                <h2 class="mt-2 text-2xl font-semibold">Трактор и урожай</h2>
              </div>
            </div>
            <div class="p-6">
              <p class="text-sm text-[#342d1e]/90">Визуализация полей, границ и задач на одной панели.</p>
              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <div class="swag-card rounded-3xl bg-[#F5F1E8] p-4 text-sm text-[#342d1e] shadow-inner border border-[#E8DDCB]">
                  <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/70">Live</p>
                  <p class="mt-2 font-semibold">Погода Open-Meteo</p>
                </div>
                <div class="swag-card rounded-3xl bg-[#F5F1E8] p-4 text-sm text-[#342d1e] shadow-inner border border-[#E8DDCB]">
                  <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/70">1100+</p>
                  <p class="mt-2 font-semibold">Населённых пунктов</p>
                </div>
              </div>
            </div>
          </div>
          <div class="login-card-rise rounded-[32px] bg-[#F5F1E8]/90 p-6 shadow-soft border border-[#E8DDCB]" style="animation-delay: 0.2s">
            <h2 class="text-xl font-semibold text-[#342d1e]">Интеллект для агронома</h2>
            <p class="mt-3 text-sm text-[#5F4A2F]/80">Риски, рекомендации и карта — без лишнего шума.</p>
            <ul class="mt-6 space-y-3 text-sm text-[#5F4A2F]">
              <li class="swag-card rounded-3xl bg-white p-4 shadow-inner border border-[#E8DDCB]">Онлайн-контроль состояния поля</li>
              <li class="swag-card rounded-3xl bg-white p-4 shadow-inner border border-[#E8DDCB]">Настраиваемые пороги рисков</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="relative flex items-center justify-center bg-[#F5F1E8] px-6 py-10">
      <div
        class="login-form-panel w-full max-w-md rounded-[32px] bg-white/95 p-8 shadow-soft backdrop-blur"
        :class="{ 'shake-form': shakeForm }"
      >
        <div class="mb-8">
          <h2 class="text-3xl font-semibold text-[#342d1e]">Вход в систему</h2>
          <p class="mt-3 text-sm text-[#5F4A2F]/80">
            admin / admin · agronom / agro2026 · worker / agro2026
          </p>
        </div>
        <form @submit.prevent="handleLogin" class="space-y-5">
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Логин</span>
            <input
              v-model="loginValue"
              type="text"
              placeholder="admin"
              class="mt-3 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
              @input="onLoginInput"
            />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-[#5F4A2F]">Пароль</span>
            <input
              v-model="passwordValue"
              type="password"
              placeholder="••••••••"
              class="mt-3 w-full rounded-3xl border border-[#E8DDCB] bg-[#F9F5EE] px-4 py-3 text-sm text-[#342d1e] outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-200"
            />
          </label>
          <button
            type="submit"
            class="btn-shimmer inline-flex w-full justify-center rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#8B6F47]"
          >
            Войти
          </button>
          <p v-if="error" class="text-sm text-rose-600">Неверный логин или пароль.</p>
          <p v-if="hint" class="text-xs font-medium text-[#8B6F47]">{{ hint }}</p>
        </form>
        <div class="mt-8 rounded-3xl bg-[#F5F1E8] p-5 text-sm text-[#5F4A2F]/90 shadow-inner border border-[#E8DDCB]">
          <p class="font-semibold text-[#5F4A2F]">Подсказка для исследователей</p>
          <p class="mt-2 text-xs leading-relaxed text-[#5F4A2F]/70">
            В поиске локации на карте или в поле логина: «тетрис». Для атмосферы: «матрица». Семь нажатий на Agro — сюрприз.
          </p>
        </div>
      </div>
    </section>

    <TetrisModal v-if="showTetris" @close="showTetris = false" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { normalizeSearchText } from '@/utils/search'
import TetrisModal from '@/components/easterEggs/TetrisModal.vue'
import MatrixRain from '@/components/easterEggs/MatrixRain.vue'

const loginValue = ref('admin')
const passwordValue = ref('admin')
const error = ref(false)
const shakeForm = ref(false)
const showTetris = ref(false)
const matrixMode = ref(false)
const goldenMode = ref(false)
const secretMessage = ref('')
const hint = ref('')
const badgeClicks = ref(0)
const router = useRouter()
const store = useAppStore()

const konami: string[] = []
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

function seedStyle(n: number) {
  const left = (n * 17) % 100
  const delay = (n * 0.7) % 5
  const duration = 8 + (n % 6)
  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

function triggerTetris() {
  showTetris.value = true
  hint.value = 'Agro Tetris активирован'
}

function onLoginInput() {
  const value = normalizeSearchText(loginValue.value)
  if (value === 'тетрис' || value === 'tetris') {
    triggerTetris()
    loginValue.value = ''
  } else if (value === 'матрица' || value === 'matrix') {
    matrixMode.value = !matrixMode.value
    hint.value = matrixMode.value ? 'Agro Matrix включена' : 'Agro Matrix выключена'
    loginValue.value = ''
  }
}

function onBadgeClick() {
  badgeClicks.value++
  if (badgeClicks.value >= 7) {
    goldenMode.value = true
    secretMessage.value = 'Golden Harvest Mode — урожай x2 (визуально)'
    badgeClicks.value = 0
  }
}

function onKonami(event: KeyboardEvent) {
  konami.push(event.key)
  if (konami.length > konamiCode.length) konami.shift()
  if (konami.join(',') === konamiCode.join(',')) {
    goldenMode.value = true
    secretMessage.value = 'Konami unlocked — золотая жатва'
    konami.length = 0
  }
}

async function handleLogin() {
  error.value = false
  const success = await store.login(loginValue.value, passwordValue.value)
  if (success) {
    router.push('/fields')
  } else {
    error.value = true
    shakeForm.value = true
    window.setTimeout(() => {
      shakeForm.value = false
    }, 600)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKonami)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKonami)
})
</script>
