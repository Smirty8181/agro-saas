import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'
import LoginView from '@/views/LoginView.vue'
import FieldMapView from '@/views/FieldMapView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import TasksView from '@/views/TasksView.vue'
import UsersView from '@/views/UsersView.vue'
import EquipmentView from '@/views/EquipmentView.vue'
import CalendarView from '@/views/CalendarView.vue'
import DataImportView from '@/views/DataImportView.vue'
import DataExportView from '@/views/DataExportView.vue'
import FieldHistoryView from '@/views/FieldHistoryView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ReportPrintView from '@/views/ReportPrintView.vue'

const routes = [
  { path: '/', redirect: '/fields' },
  { path: '/login', name: 'Login', component: LoginView, meta: { layout: 'empty', guestOnly: true } },
  { path: '/fields', name: 'Fields', component: FieldMapView, meta: { requiresAuth: true } },
  { path: '/analytics', name: 'Analytics', component: AnalyticsView, meta: { requiresAuth: true, permission: 'analytics.view' } },
  { path: '/tasks', name: 'Tasks', component: TasksView, meta: { requiresAuth: true } },
  { path: '/users', name: 'Users', component: UsersView, meta: { requiresAuth: true, permission: 'users.manage' } },
  { path: '/equipment', name: 'Equipment', component: EquipmentView, meta: { requiresAuth: true, permission: 'equipment.view' } },
  { path: '/calendar', name: 'Calendar', component: CalendarView, meta: { requiresAuth: true } },
  { path: '/import', name: 'Import', component: DataImportView, meta: { requiresAuth: true, permission: 'import.use' } },
  { path: '/export', name: 'Export', component: DataExportView, meta: { requiresAuth: true, permission: 'export.use' } },
  { path: '/export/report', name: 'ExportReport', component: ReportPrintView, meta: { requiresAuth: true, layout: 'empty', permission: 'export.use' } },
  { path: '/history', name: 'History', component: FieldHistoryView, meta: { requiresAuth: true, permission: 'history.view' } },
  { path: '/settings', name: 'Settings', component: SettingsView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const store = useAppStore()

  if (to.meta.requiresAuth && !store.isAuthenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && store.isAuthenticated) {
    return '/fields'
  }

  const permission = to.meta.permission as string | undefined
  if (permission && !store.can(permission as import('@/utils/permissions').Permission)) {
    return '/fields'
  }

  return true
})

export default router
