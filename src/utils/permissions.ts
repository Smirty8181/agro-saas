import type { Role } from '@/data/mockData'

export type Permission =
  | 'fields.view'
  | 'fields.edit'
  | 'fields.draw'
  | 'tasks.view'
  | 'tasks.complete'
  | 'tasks.create'
  | 'scouting.add'
  | 'arrival.mark'
  | 'analytics.view'
  | 'calendar.view'
  | 'equipment.view'
  | 'history.view'
  | 'import.use'
  | 'export.use'
  | 'users.manage'
  | 'settings.company'
  | 'settings.riskRules'

const ALL_PERMISSIONS: Permission[] = [
  'fields.view',
  'fields.edit',
  'fields.draw',
  'tasks.view',
  'tasks.complete',
  'tasks.create',
  'scouting.add',
  'arrival.mark',
  'analytics.view',
  'calendar.view',
  'equipment.view',
  'history.view',
  'import.use',
  'export.use',
  'users.manage',
  'settings.company',
  'settings.riskRules'
]

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Администратор: ALL_PERMISSIONS,
  Агроном: [
    'fields.view',
    'fields.edit',
    'fields.draw',
    'tasks.view',
    'tasks.complete',
    'tasks.create',
    'scouting.add',
    'arrival.mark',
    'analytics.view',
    'calendar.view',
    'equipment.view',
    'history.view',
    'import.use',
    'export.use',
    'settings.company'
  ],
  Рабочий: ['fields.view', 'tasks.view', 'tasks.complete', 'scouting.add', 'arrival.mark', 'calendar.view']
}

export const ROUTE_ACCESS: Record<string, Permission | 'auth'> = {
  '/fields': 'fields.view',
  '/tasks': 'tasks.view',
  '/calendar': 'calendar.view',
  '/analytics': 'analytics.view',
  '/equipment': 'equipment.view',
  '/history': 'history.view',
  '/import': 'import.use',
  '/export': 'export.use',
  '/export/report': 'export.use',
  '/settings': 'auth',
  '/users': 'users.manage'
}

export function permissionsForRole(role: Role | undefined): Set<Permission> {
  return new Set(ROLE_PERMISSIONS[role ?? 'Рабочий'] ?? ROLE_PERMISSIONS['Рабочий'])
}

export function canRole(role: Role | undefined, permission: Permission): boolean {
  return permissionsForRole(role).has(permission)
}

export function canAccessRoute(role: Role | undefined, path: string): boolean {
  const rule = ROUTE_ACCESS[path]
  if (!rule) return true
  if (rule === 'auth') return true
  return canRole(role, rule)
}

export function roleHomePath(role: Role | undefined) {
  return '/fields'
}

export function roleLabel(role: Role) {
  if (role === 'Администратор') return 'Администратор · полный доступ'
  if (role === 'Агроном') return 'Агроном · управление полями'
  return 'Рабочий · просмотр и выезд'
}
