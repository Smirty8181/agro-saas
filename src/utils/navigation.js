import { polygonCenter } from '@/utils/geo';
export const navigationOptions = [
    {
        id: 'yandex-nav',
        title: 'Яндекс Навигатор',
        subtitle: 'Маршрут для водителя · приложение',
        accent: '#FC3F1D'
    },
    {
        id: 'yandex-maps',
        title: 'Яндекс Карты',
        subtitle: 'Авто · пробки · веб и приложение',
        accent: '#FFCC00'
    },
    {
        id: '2gis',
        title: '2GIS',
        subtitle: 'Подъезды и локальные дороги',
        accent: '#19AA1E'
    },
    {
        id: 'google',
        title: 'Google Maps',
        subtitle: 'Универсальный маршрут',
        accent: '#4285F4'
    }
];
export function fieldDestination(field) {
    if (!field.coordinates?.length)
        return null;
    const [lat, lng] = polygonCenter(field.coordinates);
    return {
        lat,
        lng,
        label: `Поле №${field.number} · ${field.name}`
    };
}
export function buildNavigationUrl(provider, lat, lng) {
    switch (provider) {
        case 'yandex-nav':
            return `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lng}`;
        case 'yandex-maps':
            return `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`;
        case '2gis':
            return `https://2gis.ru/routeSearch/rsType/car/to/${lng},${lat}`;
        case 'google':
            return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        default:
            return `https://yandex.ru/maps/?pt=${lng},${lat}&z=14`;
    }
}
export function buildNavigationWebFallback(provider, lat, lng) {
    if (provider === 'yandex-nav') {
        return buildNavigationUrl('yandex-maps', lat, lng);
    }
    return buildNavigationUrl(provider, lat, lng);
}
export function openFieldNavigation(provider, lat, lng) {
    const primary = buildNavigationUrl(provider, lat, lng);
    const fallback = buildNavigationWebFallback(provider, lat, lng);
    if (provider === 'yandex-nav') {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = primary;
        document.body.append(iframe);
        window.setTimeout(() => {
            iframe.remove();
            window.open(fallback, '_blank', 'noopener,noreferrer');
        }, 700);
        return;
    }
    window.open(primary, '_blank', 'noopener,noreferrer');
}
export function formatCoordinates(lat, lng) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}
export async function copyFieldCoordinates(lat, lng) {
    const text = formatCoordinates(lat, lng);
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return text;
    }
    const area = document.createElement('textarea');
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    return text;
}
export function formatDistanceKm(meters) {
    if (meters < 1000)
        return `${Math.round(meters)} м`;
    return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} км`;
}
export function estimateDriveMinutes(distanceMeters) {
    const speedKmh = 45;
    const hours = distanceMeters / 1000 / speedKmh;
    return Math.max(5, Math.round(hours * 60));
}
//# sourceMappingURL=navigation.js.map