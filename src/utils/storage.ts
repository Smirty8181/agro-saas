const FIELDS_KEY = 'agro-fields'
const SETTINGS_KEY = 'agro-settings'
const WEATHER_CACHE_KEY = 'agro-weather-cache'
const IMPORT_KEY = 'agro-import-records'
const EXPORT_KEY = 'agro-export-records'
const SCOUT_KEY = 'agro-scout-reports'
const ARRIVALS_KEY = 'agro-field-arrivals'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  companyName: string
  notifyEmail: boolean
  notifySms: boolean
  notifyWeather: boolean
  notifyTasks: boolean
  compactMobile: boolean
  autoNightMap: boolean
  nightMapUnlocked: boolean
  showNightMapBadge: boolean
}

export const defaultSettings: AppSettings = {
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
}

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadSettings(): AppSettings {
  return { ...defaultSettings, ...loadJson<Partial<AppSettings>>(SETTINGS_KEY, {}) }
}

export function saveSettings(settings: AppSettings) {
  saveJson(SETTINGS_KEY, settings)
}

export function loadFields<T>(seed: T[]): T[] {
  const stored = loadJson<T[] | null>(FIELDS_KEY, null)
  return stored?.length ? stored : seed
}

export function saveFields<T>(fields: T[]) {
  saveJson(FIELDS_KEY, fields)
}

export function loadWeatherCache<T>(fallback: T): T {
  return loadJson(WEATHER_CACHE_KEY, fallback)
}

export function saveWeatherCache<T>(weather: T) {
  saveJson(WEATHER_CACHE_KEY, weather)
}

export function loadImportRecords<T>(seed: T[]): T[] {
  return loadJson(IMPORT_KEY, seed)
}

export function saveImportRecords<T>(records: T[]) {
  saveJson(IMPORT_KEY, records)
}

export function loadExportRecords<T>(seed: T[]): T[] {
  return loadJson(EXPORT_KEY, seed)
}

export function saveExportRecords<T>(records: T[]) {
  saveJson(EXPORT_KEY, records)
}

export function loadScoutReports<T>(seed: T[] = [] as T[]): T[] {
  return loadJson(SCOUT_KEY, seed)
}

export function saveScoutReports<T>(reports: T[]) {
  saveJson(SCOUT_KEY, reports)
}

export function loadFieldArrivals<T>(seed: T[] = [] as T[]): T[] {
  return loadJson(ARRIVALS_KEY, seed)
}

export function saveFieldArrivals<T>(arrivals: T[]) {
  saveJson(ARRIVALS_KEY, arrivals)
}

export function applyTheme(theme: AppSettings['theme']) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('theme-dark', dark)
  root.dataset.theme = dark ? 'dark' : 'light'
}
