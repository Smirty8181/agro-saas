<template>
  <div class="min-h-screen bg-[#F5F1E8] text-[#342d1e] theme-app">
    <div
      v-if="store.saveMessage"
      class="fixed bottom-20 left-4 right-4 z-[99999] mx-auto max-w-md rounded-3xl bg-[#342d1e] px-5 py-3 text-center text-sm font-semibold text-white shadow-2xl md:bottom-6 xl:left-auto"
    >
      {{ store.saveMessage }}
    </div>

    <div class="flex min-h-screen">
      <aside class="hidden xl:flex w-72 flex-col bg-white/80 backdrop-blur-lg border-r border-slate-200/80 p-6 shadow-soft theme-panel">
        <BrandBlock />
        <NavList :items="navItems" />
        <SystemStatus class="mt-auto" />
      </aside>

      <div v-if="mobileNavOpen" class="fixed inset-0 z-40 bg-black/40 xl:hidden" @click="mobileNavOpen = false" />

      <aside
        class="fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[#E8DDCB] bg-white p-5 shadow-2xl transition xl:hidden theme-panel"
        :class="mobileNavOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="mb-4 flex items-center justify-between">
          <BrandBlock compact />
          <button @click="mobileNavOpen = false" class="rounded-full bg-[#F5F1E8] px-3 py-2 text-sm font-semibold text-[#5F4A2F]">Закрыть</button>
        </div>
        <NavList :items="navItems" @navigate="mobileNavOpen = false" />
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg px-4 py-3 shadow-sm md:px-6 md:py-4 theme-panel">
          <div class="flex flex-col gap-3 md:gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div class="flex items-start gap-3">
              <button
                @click="mobileNavOpen = true"
                class="mt-1 inline-flex rounded-2xl border border-[#E8DDCB] bg-white px-3 py-2 text-sm font-semibold text-[#5F4A2F] xl:hidden"
              >
                Меню
              </button>
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-[#8B6F47]/70 md:text-sm md:tracking-[0.3em]">Agro</p>
                <h1 class="mt-1 text-lg font-semibold text-[#342d1e] theme-text md:mt-2 md:text-2xl">
                  {{ store.isWorker ? 'Мои поля и задачи' : 'Панель управления' }}
                </h1>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 md:gap-3">
              <div class="relative">
                <button @click.stop="toggleNotifications" class="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#5F4A2F] transition hover:border-amber-300 hover:shadow-sm md:px-4">
                  <Bell class="h-4 w-4" />
                  <span class="hidden sm:inline">Уведомления</span>
                  <span v-if="unreadNotifications" class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-100 px-2 text-[11px] font-semibold text-rose-700">{{ unreadNotifications }}</span>
                </button>
                <div v-if="showNotifications" class="absolute right-0 z-30 mt-2 w-[calc(100vw-2rem)] max-w-96 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl sm:w-96">
                  <div class="flex items-center justify-between pb-3">
                    <div>
                      <p class="text-sm font-semibold text-[#342d1e]">Уведомления</p>
                      <p class="text-xs text-[#5F4A2F]/70">Предупреждения по погоде, полям и задачам</p>
                    </div>
                    <button @click="showNotifications = false" class="text-xs text-[#5F4A2F] hover:text-[#342d1e]">Закрыть</button>
                  </div>
                  <div class="max-h-72 space-y-3 overflow-y-auto">
                    <div v-for="item in store.notifications" :key="item.id" :class="notificationClass(item.severity)" class="rounded-3xl p-3 text-sm">
                      <div class="flex items-start gap-3">
                        <span :class="notificationDotClass(item.severity)"></span>
                        <div class="min-w-0 flex-1">
                          <p class="font-semibold">{{ item.title }}</p>
                          <p class="mt-1 text-xs opacity-90">{{ item.description }}</p>
                          <button v-if="item.actionPath" @click="openNotification(item)" class="mt-2 text-xs font-semibold underline opacity-90">Перейти</button>
                        </div>
                        <button @click="store.dismissNotification(item.id)" class="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#8B6F47] opacity-80 hover:opacity-100">Скрыть</button>
                      </div>
                    </div>
                    <div v-if="!store.notifications.length" class="rounded-3xl bg-[#F5F1E8] p-4 text-sm text-[#5F4A2F]">Все предупреждения просмотрены.</div>
                  </div>
                  <button v-if="store.notifications.length" @click="store.restoreNotifications()" class="mt-3 w-full rounded-3xl border border-[#E8DDCB] bg-[#F5F1E8] px-4 py-2 text-xs font-semibold text-[#5F4A2F]">Показать скрытые снова</button>
                </div>
              </div>
              <div class="relative">
                <button @click.stop="toggleProfileMenu" class="inline-flex items-center gap-2 rounded-3xl bg-amber-100 px-3 py-2 text-sm font-semibold text-[#5F4A2F] shadow-sm transition hover:bg-amber-200 md:px-4">
                  <User class="h-4 w-4" />
                  <span class="max-w-[120px] truncate sm:max-w-none">{{ store.currentUser.name }}</span>
                </button>
                <div v-if="showProfileMenu" class="absolute right-0 z-30 mt-2 w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
                  <p class="text-sm font-semibold text-[#342d1e]">Профиль</p>
                  <p class="mt-2 text-sm text-[#5F4A2F]">{{ store.currentUser.role }}</p>
                <p class="mt-1 text-xs text-[#8B6F47]">{{ store.userRoleLabel }}</p>
                  <p class="mt-1 text-xs text-[#5F4A2F]/80">{{ store.currentUser.email }}</p>
                  <div class="mt-4 space-y-2">
                    <RouterLink to="/settings" @click="showProfileMenu = false" class="block w-full rounded-3xl border border-[#E8DDCB] bg-white px-4 py-3 text-center text-sm font-semibold text-[#5F4A2F]">Настройки</RouterLink>
                    <button @click="handleLogout" class="w-full rounded-3xl bg-[#B89B72] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8B6F47]">Выйти</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6 xl:px-8">
          <slot />
        </main>

        <nav class="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E8DDCB] bg-white/95 px-2 py-2 backdrop-blur-lg xl:hidden theme-panel">
          <div class="mx-auto grid max-w-lg grid-cols-5 gap-1">
            <RouterLink
              v-for="item in mobileNavItems"
              :key="item.path"
              :to="item.path"
              class="flex flex-col items-center rounded-2xl px-1 py-2 text-[10px] font-semibold text-[#5F4A2F]"
              :class="{ 'bg-amber-50 text-amber-900': route.path === item.path }"
            >
              <component :is="item.icon" class="mb-1 h-4 w-4" />
              {{ item.short }}
            </RouterLink>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import type { AppNotification } from '@/data/mockData'
import { notificationDotClass as getNotificationDotClass } from '@/utils/uiBadges'
import { Bell, MapPin, BarChart3, ClipboardList, Users, Truck, CalendarDays, UploadCloud, DownloadCloud, Clock3, Settings, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const showNotifications = ref(false)
const showProfileMenu = ref(false)
const mobileNavOpen = ref(false)

const unreadNotifications = computed(() => store.notifications.length)

const BrandBlock = defineComponent({
  props: { compact: Boolean },
  setup(props) {
    return () =>
      h('div', { class: props.compact ? 'mb-2' : 'mb-8' }, [
        h('div', { class: 'inline-flex items-center gap-3 rounded-3xl bg-[#F5F1E8] px-4 py-3 text-sm font-semibold text-[#5F4A2F] shadow-sm shadow-[#8B6F47]/10' }, [
          h('img', { src: '/logo.png', alt: 'Agro', class: 'h-8 w-8 shrink-0 rounded-full object-cover' }),
          'Agro'
        ]),
        props.compact
          ? null
          : h('div', { class: 'mt-6 text-2xl font-bold leading-tight break-words theme-text' }, 'Управление сельскохозяйственными угодьями')
      ])
  }
})

const SystemStatus = defineComponent({
  setup() {
    return () =>
      h('div', { class: 'rounded-3xl border border-[#E8DDCB] bg-white p-5 shadow-soft theme-panel-inner' }, [
        h('p', { class: 'text-xs uppercase tracking-[0.3em] text-[#8B6F47]/70' }, 'Статус системы'),
        h('p', { class: 'mt-4 text-sm font-semibold theme-text' }, 'Все службы работают стабильно')
      ])
  }
})

const NavList = defineComponent({
  props: { items: { type: Array, required: true } },
  emits: ['navigate'],
  setup(props, { emit }) {
    const currentRoute = useRoute()
    return () =>
      h(
        'nav',
        { class: 'space-y-1 overflow-y-auto max-h-[70vh] scrollbar-thin' },
        (props.items as Array<{ name: string; path: string; icon: unknown }>).map((item) =>
          h(
            RouterLink,
            {
              to: item.path,
              class: [
                'group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold text-[#5F4A2F] transition hover:bg-amber-100 hover:text-amber-900',
                currentRoute.path === item.path ? 'bg-amber-50 text-amber-900' : ''
              ],
              onClick: () => emit('navigate')
            },
            [h(item.icon as object, { class: 'h-5 w-5' }), h('span', item.name)]
          )
        )
      )
  }
})

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) showProfileMenu.value = false
}

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
  if (showProfileMenu.value) showNotifications.value = false
}

function handleLogout() {
  store.logout()
  router.push('/login')
}

function notificationClass(severity: AppNotification['severity']) {
  if (severity === 'danger') return 'bg-rose-50 text-rose-900 border border-rose-100'
  if (severity === 'warning') return 'bg-amber-50 text-amber-900 border border-amber-100'
  return 'bg-sky-50 text-sky-900 border border-sky-100'
}

function notificationDotClass(severity: AppNotification['severity']) {
  return getNotificationDotClass(severity)
}

function openNotification(item: AppNotification) {
  store.dismissNotification(item.id)
  showNotifications.value = false
  if (item.actionPath) router.push(item.actionPath)
}

const navItems = computed(() => {
  const items = [
    { name: 'Карта полей', path: '/fields', icon: MapPin, permission: 'fields.view' as const },
    { name: 'Аналитика', path: '/analytics', icon: BarChart3, permission: 'analytics.view' as const },
    { name: 'Задания', path: '/tasks', icon: ClipboardList, permission: 'tasks.view' as const },
    { name: 'Пользователи', path: '/users', icon: Users, permission: 'users.manage' as const },
    { name: 'Техника', path: '/equipment', icon: Truck, permission: 'equipment.view' as const },
    { name: 'Календарь', path: '/calendar', icon: CalendarDays, permission: 'calendar.view' as const },
    { name: 'Импорт', path: '/import', icon: UploadCloud, permission: 'import.use' as const },
    { name: 'Экспорт', path: '/export', icon: DownloadCloud, permission: 'export.use' as const },
    { name: 'История полей', path: '/history', icon: Clock3, permission: 'history.view' as const },
    { name: 'Настройки', path: '/settings', icon: Settings }
  ]
  return items.filter((item) => !item.permission || store.can(item.permission))
})

const mobileNavItems = computed(() => {
  const items = [
    { path: '/fields', short: 'Карта', icon: MapPin, permission: 'fields.view' as const },
    { path: '/tasks', short: 'Задачи', icon: ClipboardList, permission: 'tasks.view' as const },
    { path: '/calendar', short: 'Кален.', icon: CalendarDays, permission: 'calendar.view' as const },
    { path: '/analytics', short: 'Аналит.', icon: BarChart3, permission: 'analytics.view' as const },
    { path: '/settings', short: 'Ещё', icon: Settings }
  ]
  const allowed = items.filter((item) => !item.permission || store.can(item.permission))
  return allowed.slice(0, 5)
})
</script>
