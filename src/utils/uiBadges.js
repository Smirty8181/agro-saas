export function recommendationBadgeClass(icon) {
    return `rec-badge rec-badge--${icon}`;
}
export function notificationDotClass(severity) {
    return `notif-dot notif-dot--${severity}`;
}
export function weatherCodeLabel(code) {
    if (!code)
        return '—';
    if (code === 'clear')
        return 'ЯСН';
    if (code === 'partly')
        return 'ОБЛ';
    if (code === 'rain' || code === 'shower')
        return 'ДОЖ';
    if (code === 'snow')
        return 'СНГ';
    if (code === 'fog')
        return 'ТМН';
    if (code === 'storm')
        return 'ГРЗ';
    return 'ОБЛ';
}
export function weatherCodeFromIcon(icon) {
    if (!icon)
        return 'partly';
    if (['clear', 'partly', 'rain', 'shower', 'snow', 'fog', 'storm'].includes(icon))
        return icon;
    return 'partly';
}
//# sourceMappingURL=uiBadges.js.map