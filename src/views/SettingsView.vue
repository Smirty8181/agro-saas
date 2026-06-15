<template>
  <div class="space-y-6 md:space-y-8">
    <section class="rounded-[28px] border border-[#E8DDCB] bg-white/95 p-4 shadow-soft md:rounded-[32px] md:p-6 theme-panel">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-semibold text-[#342d1e] theme-text">Настройки</h2>
          <p class="mt-2 text-sm text-[#5F4A2F]/80 theme-muted">Тема, безопасность, уведомления и параметры платформы.</p>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5 theme-panel-inner">
          <h3 class="text-lg font-semibold text-[#342d1e] theme-text">Оформление</h3>
          <div class="mt-5 space-y-4">
            <label class="block">
              <span class="text-sm font-semibold text-[#5F4A2F] theme-muted">Тема интерфейса</span>
              <select
                v-model="theme"
                @change="applyThemeSetting"
                class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm outline-none theme-input"
              >
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
                <option value="system">Как в системе</option>
              </select>
            </label>
            <label v-if="store.can('settings.company')" class="block">
              <span class="text-sm font-semibold text-[#5F4A2F] theme-muted">Название компании</span>
              <input
                v-model="companyName"
                @blur="saveCompany"
                class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm outline-none theme-input"
              />
            </label>
          </div>
        </div>

        <div v-if="store.can('settings.company')" class="rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5 theme-panel-inner">
          <h3 class="text-lg font-semibold text-[#342d1e] theme-text">Уведомления</h3>
          <div class="mt-5 space-y-3 text-sm">
            <label class="flex items-center justify-between rounded-3xl bg-white px-4 py-3 theme-input">
              <span>Email-оповещения</span>
              <input type="checkbox" v-model="notifyEmail" @change="saveNotifications" />
            </label>
            <label class="flex items-center justify-between rounded-3xl bg-white px-4 py-3 theme-input">
              <span>SMS-сообщения</span>
              <input type="checkbox" v-model="notifySms" @change="saveNotifications" />
            </label>
            <label class="flex items-center justify-between rounded-3xl bg-white px-4 py-3 theme-input">
              <span>Погодные предупреждения</span>
              <input type="checkbox" v-model="notifyWeather" @change="saveNotifications" />
            </label>
            <label class="flex items-center justify-between rounded-3xl bg-white px-4 py-3 theme-input">
              <span>Задачи и поля</span>
              <input type="checkbox" v-model="notifyTasks" @change="saveNotifications" />
            </label>
          </div>
        </div>

        <div class="rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5 theme-panel-inner lg:col-span-2">
          <h3 class="text-lg font-semibold text-[#342d1e] theme-text">Смена пароля</h3>
          <p class="mt-2 text-sm text-[#5F4A2F]/80 theme-muted">Пользователь: {{ store.currentUser.login }}</p>
          <form @submit.prevent="submitPassword" class="mt-5 grid gap-4 md:grid-cols-3">
            <input
              v-model="currentPassword"
              type="password"
              placeholder="Текущий пароль"
              class="rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm outline-none theme-input"
            />
            <input
              v-model="newPassword"
              type="password"
              placeholder="Новый пароль"
              class="rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm outline-none theme-input"
            />
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              class="rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm outline-none theme-input"
            />
            <div class="md:col-span-3 flex flex-wrap items-center gap-3">
              <button type="submit" class="rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8B6F47]">
                Обновить пароль
              </button>
              <p v-if="passwordMessage" :class="passwordOk ? 'text-emerald-700' : 'text-rose-700'" class="text-sm">{{ passwordMessage }}</p>
            </div>
          </form>
        </div>

        <div v-if="store.can('settings.riskRules')" class="rounded-[28px] border border-[#E8DDCB] bg-[#F5F1E8] p-5 theme-panel-inner lg:col-span-2">
          <h3 class="text-lg font-semibold text-[#342d1e] theme-text">Правила рисков агропомощника</h3>
          <p class="mt-2 text-sm text-[#5F4A2F]/80 theme-muted">Настройте пороги для предупреждений о дожде, влажности почвы, ветре и заморозках.</p>
          <div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label class="block">
              <span class="text-xs font-semibold text-[#5F4A2F]">Дождь — предупреждение, мм</span>
              <input v-model.number="riskForm.rainWarningMm" type="number" min="0" step="0.5" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm theme-input" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-[#5F4A2F]">Дождь — опасно, мм</span>
              <input v-model.number="riskForm.rainDangerMm" type="number" min="0" step="0.5" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm theme-input" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-[#5F4A2F]">Влажность почвы — низкая, %</span>
              <input v-model.number="riskForm.soilHumidityLow" type="number" min="0" max="100" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm theme-input" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-[#5F4A2F]">Влажность почвы — высокая, %</span>
              <input v-model.number="riskForm.soilHumidityHigh" type="number" min="0" max="100" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm theme-input" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-[#5F4A2F]">Макс. ветер, м/с</span>
              <input v-model.number="riskForm.windMaxMs" type="number" min="0" step="1" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm theme-input" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-[#5F4A2F]">Заморозки, °C</span>
              <input v-model.number="riskForm.frostTempC" type="number" step="1" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm theme-input" />
            </label>
            <label class="block">
              <span class="text-xs font-semibold text-[#5F4A2F]">Осадки за неделю — высокие, мм</span>
              <input v-model.number="riskForm.weekRainHigh" type="number" min="0" step="1" class="mt-2 w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-sm theme-input" />
            </label>
          </div>
          <button type="button" @click="saveRiskRules" class="mt-5 rounded-3xl bg-[#B89B72] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8B6F47]">
            Сохранить правила рисков
          </button>
        </div>

        <div class="rounded-[28px] border border-[#E8DDCB] bg-white p-5 shadow-sm lg:col-span-2 theme-panel-inner">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-[#342d1e] theme-text">Карта и данные</h3>
              <p class="mt-1 text-sm text-[#5F4A2F]/80 theme-muted">После 21:00 карта автоматически переключается в ночной режим.</p>
            </div>
            <div
              v-if="store.settings.nightMapUnlocked"
              class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-800"
            >
              <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
              Ночной режим — засчитано
            </div>
          </div>

          <div class="mt-5 space-y-3 text-sm">
            <label class="flex items-center justify-between rounded-3xl bg-[#F5F1E8] px-4 py-3 theme-panel-inner">
              <span>Авто-ночной режим карты (после 21:00)</span>
              <input type="checkbox" v-model="autoNightMap" @change="saveMapSettings" />
            </label>
            <label class="flex items-center justify-between rounded-3xl bg-[#F5F1E8] px-4 py-3 theme-panel-inner">
              <span>Показывать бейдж «засчитано» на карте</span>
              <input type="checkbox" v-model="showNightMapBadge" :disabled="!store.settings.nightMapUnlocked" @change="saveMapSettings" />
            </label>
            <p v-if="store.nightModeActive && store.settings.autoNightMap" class="text-xs text-indigo-700">
              Сейчас активен ночной режим (до 06:00). Выберите другую подложку на карте, чтобы переопределить до утра.
            </p>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button @click="store.setMapBaseLayer('standard')" class="rounded-3xl border border-[#E8DDCB] px-4 py-3 text-sm hover:bg-[#F5F1E8]">Подложка: стандарт</button>
            <button @click="store.setMapBaseLayer('night')" class="rounded-3xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900 hover:bg-indigo-100">Подложка: ночная</button>
            <button @click="store.setShowCropColors(true)" class="rounded-3xl border border-[#E8DDCB] px-4 py-3 text-sm hover:bg-[#F5F1E8]">Подсветка культур: вкл</button>
            <button @click="store.loadWeather(true)" class="rounded-3xl border border-[#E8DDCB] px-4 py-3 text-sm hover:bg-[#F5F1E8]">Обновить погоду</button>
          </div>
        </div>      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import type { RiskRules } from '@/data/mockData'

const store = useAppStore()
const theme = ref(store.settings.theme)
const companyName = ref(store.settings.companyName)
const notifyEmail = ref(store.settings.notifyEmail)
const notifySms = ref(store.settings.notifySms)
const notifyWeather = ref(store.settings.notifyWeather)
const notifyTasks = ref(store.settings.notifyTasks)
const riskForm = reactive<RiskRules>({ ...store.riskRules })
const autoNightMap = ref(store.settings.autoNightMap ?? true)
const showNightMapBadge = ref(store.settings.showNightMapBadge ?? true)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordMessage = ref('')
const passwordOk = ref(false)

watch(
  () => store.settings,
  (value) => {
    theme.value = value.theme
    companyName.value = value.companyName
    notifyEmail.value = value.notifyEmail
    notifySms.value = value.notifySms
    notifyWeather.value = value.notifyWeather
    notifyTasks.value = value.notifyTasks
    autoNightMap.value = value.autoNightMap ?? true
    showNightMapBadge.value = value.showNightMapBadge ?? true
  },
  { deep: true }
)

watch(
  () => store.riskRules,
  (value) => {
    Object.assign(riskForm, value)
  },
  { deep: true }
)

function saveRiskRules() {
  store.updateRiskRules({ ...riskForm })
}

function applyThemeSetting() {
  store.updateSettings({ theme: theme.value })
}

function saveCompany() {
  store.updateSettings({ companyName: companyName.value.trim() || 'Diploom Агрохолдинг' })
}

function saveMapSettings() {
  store.updateSettings({
    autoNightMap: autoNightMap.value,
    showNightMapBadge: showNightMapBadge.value
  })
}

function saveNotifications() {
  store.updateSettings({
    notifyEmail: notifyEmail.value,
    notifySms: notifySms.value,
    notifyWeather: notifyWeather.value,
    notifyTasks: notifyTasks.value
  })
}

function submitPassword() {
  passwordMessage.value = ''
  if (newPassword.value !== confirmPassword.value) {
    passwordOk.value = false
    passwordMessage.value = 'Новые пароли не совпадают'
    return
  }
  store.changePassword(currentPassword.value, newPassword.value).then((result) => {
    passwordOk.value = result.ok
    passwordMessage.value = result.message
    if (result.ok) {
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    }
  })
}
</script>
