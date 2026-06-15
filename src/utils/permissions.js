const ALL_PERMISSIONS = [
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
];
const ROLE_PERMISSIONS = {
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
};
export const ROUTE_ACCESS = {
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
};
export function permissionsForRole(role) {
    return new Set(ROLE_PERMISSIONS[role ?? 'Рабочий'] ?? ROLE_PERMISSIONS['Рабочий']);
}
export function canRole(role, permission) {
    return permissionsForRole(role).has(permission);
}
export function canAccessRoute(role, path) {
    const rule = ROUTE_ACCESS[path];
    if (!rule)
        return true;
    if (rule === 'auth')
        return true;
    return canRole(role, rule);
}
export function roleHomePath(role) {
    return '/fields';
}
export function roleLabel(role) {
    if (role === 'Администратор')
        return 'Администратор · полный доступ';
    if (role === 'Агроном')
        return 'Агроном · управление полями';
    return 'Рабочий · просмотр и выезд';
}
//# sourceMappingURL=permissions.js.map