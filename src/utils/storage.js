const FIELDS_KEY = 'agro-fields';
const SETTINGS_KEY = 'agro-settings';
const WEATHER_CACHE_KEY = 'agro-weather-cache';
const IMPORT_KEY = 'agro-import-records';
const EXPORT_KEY = 'agro-export-records';
const SCOUT_KEY = 'agro-scout-reports';
const ARRIVALS_KEY = 'agro-field-arrivals';
export const defaultSettings = {
    theme: 'light',
    companyName: 'Diploom Агрохолдинг',
    notifyEmail: true,
    notifySms: false,
    notifyWeather: true,
    notifyTasks: true,
    compactMobile: false,
    autoNightMap: true,
    nightMapUnlocked: false,
    showNightMapBadge: true
};
export function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    }
    catch {
        return fallback;
    }
}
export function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
export function loadSettings() {
    return { ...defaultSettings, ...loadJson(SETTINGS_KEY, {}) };
}
export function saveSettings(settings) {
    saveJson(SETTINGS_KEY, settings);
}
export function loadFields(seed) {
    const stored = loadJson(FIELDS_KEY, null);
    return stored?.length ? stored : seed;
}
export function saveFields(fields) {
    saveJson(FIELDS_KEY, fields);
}
export function loadWeatherCache(fallback) {
    return loadJson(WEATHER_CACHE_KEY, fallback);
}
export function saveWeatherCache(weather) {
    saveJson(WEATHER_CACHE_KEY, weather);
}
export function loadImportRecords(seed) {
    return loadJson(IMPORT_KEY, seed);
}
export function saveImportRecords(records) {
    saveJson(IMPORT_KEY, records);
}
export function loadExportRecords(seed) {
    return loadJson(EXPORT_KEY, seed);
}
export function saveExportRecords(records) {
    saveJson(EXPORT_KEY, records);
}
export function loadScoutReports(seed = []) {
    return loadJson(SCOUT_KEY, seed);
}
export function saveScoutReports(reports) {
    saveJson(SCOUT_KEY, reports);
}
export function loadFieldArrivals(seed = []) {
    return loadJson(ARRIVALS_KEY, seed);
}
export function saveFieldArrivals(arrivals) {
    saveJson(ARRIVALS_KEY, arrivals);
}
export function applyTheme(theme) {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = theme === 'dark' || (theme === 'system' && prefersDark);
    root.classList.toggle('theme-dark', dark);
    root.dataset.theme = dark ? 'dark' : 'light';
}
//# sourceMappingURL=storage.js.map