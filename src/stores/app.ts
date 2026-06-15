import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { Field, Role, User, ImportRecord, ExportRecord, Task, RiskRules, FieldChangeLog, ScoutReport, FieldArrival } from '@/data/mockData'
import {
  fields as seedFields,
  users as seedUsers,
  equipment,
  tasks as seedTasks,
  weather as initialWeather,
  importRecords as seedImportRecords,
  exportRecords as seedExportRecords,
  cropPalette,
  defaultRiskRules
} from '@/data/mockData'
import { fetchWeather } from '@/services/weather'
import { buildNotifications, buildRecommendations, buildRiskIndexes } from '@/services/agroIntelligence'
import { findRegion, mapRegions, ensureSettlementsLoaded } from '@/data/regions'
import { isNightHours, type BaseLayerId } from '@/utils/mapLayers'
import { pointInPolygon, requestCurrentPosition } from '@/utils/geo'
import { canRole, canAccessRoute, roleLabel, type Permission } from '@/utils/permissions'
import {
  apiBootstrap,
  apiChangePassword,
  apiConfirmImport,
  apiCreateField,
  apiFieldChangelog,
  apiHealth,
  apiLogExport,
  apiLogin,
  apiPatchField,
  apiPatchTask,
  apiPreviewImport,
  apiUpdateRiskRules,
  apiUpdateSettings,
  getToken,
  setToken,
  type ImportDraft
} from '@/services/api'
import {
  applyTheme,
  loadExportRecords,
  loadFieldArrivals,
  loadFields,
  loadImportRecords,
  loadScoutReports,
  loadSettings,
  loadWeatherCache,
  saveExportRecords,
  saveFieldArrivals,
  saveFields,
  saveImportRecords,
  saveScoutReports,
  saveSettings,
  saveWeatherCache,
  type AppSettings
} from '@/utils/storage'

const AUTH_KEY = 'agro-auth'
const USER_KEY = 'agro-user'
const REGION_KEY = 'agro-region'
const DISMISSED_NOTIF_KEY = 'agro-dismissed-notifications'
const USERS_KEY = 'agro-users'

function loadDismissedNotifications() {
  try {
    const raw = localStorage.getItem(DISMISSED_NOTIF_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function loadStoredUserId() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw).id as string) : ''
  } catch {
    return ''
  }
}

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as User[]) : [...seedUsers]
  } catch {
    return [...seedUsers]
  }
}

function persistUsers(list: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list))
}

export const useAppStore = defineStore('app', () => {
  const storedUserId = loadStoredUserId()
  const isAuthenticated = ref(localStorage.getItem(AUTH_KEY) === 'true' && !!storedUserId)
  const currentUserId = ref(storedUserId)
  const selectedFieldId = ref(loadFields(seedFields)[0]?.id ?? seedFields[0].id)
  const selectedTaskId = ref(seedTasks[0]?.id ?? '')
  const mapFocusFieldId = ref<string | null>(null)
  const mapFocusToken = ref(0)
  const showScoutingLayer = ref(localStorage.getItem('agro-scout-layer') !== 'false')
  const activeCrop = ref('')
  const activeStatus = ref('')
  const activeAgronomist = ref('')
  const searchTerm = ref('')
  const showWeather = ref(true)
  const showTasksLayer = ref(true)
  const showEquipmentLayer = ref(false)
  const showHistoryLayer = ref(false)
  const showYieldLayer = ref(true)
  const showNdviLayer = ref(localStorage.getItem('agro-ndvi-layer') === 'true')
  const showCropColors = ref(localStorage.getItem('agro-crop-colors') !== 'false')
  const mapBaseLayer = ref<BaseLayerId>(
    (localStorage.getItem('agro-base-layer') as BaseLayerId) || 'standard'
  )
  const mapLayerManual = ref(false)
  const nightModeActive = ref(isNightHours())
  const weather = ref(loadWeatherCache({ ...initialWeather }))
  const weatherLoading = ref(false)
  const weatherError = ref('')
  const selectedRegionId = ref(localStorage.getItem(REGION_KEY) || 'yuzhny-proekt')
  const dismissedNotificationIds = ref<string[]>(loadDismissedNotifications())
  const fieldsList = ref<Field[]>(loadFields(seedFields))
  const tasksList = ref<Task[]>([...seedTasks])
  const scoutReportsList = ref<ScoutReport[]>(loadScoutReports<ScoutReport>([]))
  const fieldArrivalsList = ref<FieldArrival[]>(loadFieldArrivals<FieldArrival>([]))
  const usersList = ref<User[]>(loadUsers())
  const importRecordsList = ref<ImportRecord[]>(loadImportRecords(seedImportRecords))
  const exportRecordsList = ref<ExportRecord[]>(loadExportRecords(seedExportRecords))
  const settings = ref<AppSettings>(loadSettings())
  const riskRules = ref<RiskRules>({ ...defaultRiskRules })
  const fieldChangelog = ref<FieldChangeLog[]>([])
  const apiOnline = ref(false)
  const saveMessage = ref('')
  let nightWatchTimer = 0
  let wasNight = isNightHours()

  const effectiveMapBaseLayer = computed<BaseLayerId>(() => {
    if (settings.value.autoNightMap && isNightHours() && !mapLayerManual.value) {
      return 'night'
    }
    return mapBaseLayer.value
  })

  const showNightMapBadge = computed(
    () => settings.value.showNightMapBadge && settings.value.nightMapUnlocked && nightModeActive.value
  )

  applyTheme(settings.value.theme)

  watch(
    () => settings.value.theme,
    (theme) => applyTheme(theme)
  )

  const currentUser = computed(() => usersList.value.find((item) => item.id === currentUserId.value) ?? usersList.value[0])
  const isAdmin = computed(() => currentUser.value?.role === 'Администратор')
  const isAgronomist = computed(() => currentUser.value?.role === 'Агроном')
  const isWorker = computed(() => currentUser.value?.role === 'Рабочий')
  const userRoleLabel = computed(() => roleLabel(currentUser.value?.role ?? 'Рабочий'))

  function can(permission: Permission) {
    return canRole(currentUser.value?.role, permission)
  }

  function canRoute(path: string) {
    return canAccessRoute(currentUser.value?.role, path)
  }
  const selectedRegion = computed(() => findRegion(selectedRegionId.value))

  const selectedField = computed(() => fieldsList.value.find((item) => item.id === selectedFieldId.value) ?? fieldsList.value[0])
  const selectedTask = computed(() => tasksList.value.find((item) => item.id === selectedTaskId.value) ?? tasksList.value[0])

  const filteredFields = computed(() => {
    return fieldsList.value.filter((field) => {
      const cropMatch = activeCrop.value ? field.crop === activeCrop.value : true
      const statusMatch = activeStatus.value ? field.status === activeStatus.value : true
      const agronomistMatch = activeAgronomist.value ? field.agronomist === activeAgronomist.value : true
      const search = searchTerm.value.trim().toLowerCase()
      const searchMatch =
        !search ||
        [field.number.toString(), field.name, field.crop, field.agronomist, field.id].some((value) =>
          value.toLowerCase().includes(search)
        )
      return cropMatch && statusMatch && agronomistMatch && searchMatch
    })
  })

  const autocomplete = computed(() => {
    const query = searchTerm.value.trim().toLowerCase()
    if (!query) return []
    return fieldsList.value
      .filter((field) =>
        [field.number.toString(), field.name, field.crop, field.agronomist].some((value) =>
          value.toLowerCase().includes(query)
        )
      )
      .slice(0, 6)
  })

  const fieldCropOptions = computed(() => [...new Set(fieldsList.value.map((field) => field.crop))])
  const fieldStatusOptions = computed(() => [...new Set(fieldsList.value.map((field) => field.status))])
  const agronomistOptions = computed(() => [...new Set(fieldsList.value.map((field) => field.agronomist))])

  const analyticsSummary = computed(() => {
    const list = fieldsList.value
    const totalArea = list.reduce((sum, field) => sum + field.area, 0)
    const avgYield = list.length ? list.reduce((sum, field) => sum + field.yield, 0) / list.length : 0
    const activeTasks = tasksList.value.filter((task) => task.status !== 'Выполнено').length
    const cropCounts = fieldCropOptions.value.map((crop) => ({
      crop,
      count: list.filter((field) => field.crop === crop).length,
      area: list.filter((field) => field.crop === crop).reduce((sum, field) => sum + field.area, 0),
      avgYield: list.filter((field) => field.crop === crop).reduce((sum, field) => sum + field.yield, 0) /
        Math.max(1, list.filter((field) => field.crop === crop).length)
    }))
    return {
      fieldCount: list.length,
      totalArea: Math.round(totalArea),
      activeTasks,
      avgYield: Number(avgYield.toFixed(1)),
      cropCounts
    }
  })

  const agroContext = computed(() => ({
    weather: weather.value,
    selectedField: selectedField.value,
    fields: fieldsList.value,
    tasks: tasksList.value,
    equipment,
    regionName: selectedRegion.value.name,
    riskRules: riskRules.value
  }))

  const recommendations = computed(() => buildRecommendations(agroContext.value))
  const riskIndexes = computed(() => buildRiskIndexes(agroContext.value))
  const notifications = computed(() => {
    const all = buildNotifications(agroContext.value)
    return all.filter((item) => {
      if (dismissedNotificationIds.value.includes(item.id)) return false
      if (item.type === 'weather' && !settings.value.notifyWeather) return false
      if (item.type === 'task' && !settings.value.notifyTasks) return false
      return true
    })
  })

  function persistFields() {
    saveFields(fieldsList.value)
  }

  function flashSaveMessage(text: string) {
    saveMessage.value = text
    window.setTimeout(() => {
      if (saveMessage.value === text) saveMessage.value = ''
    }, 3000)
  }

  function persistSession(userId: string) {
    localStorage.setItem(AUTH_KEY, 'true')
    localStorage.setItem(USER_KEY, JSON.stringify({ id: userId }))
  }

  function clearSession() {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(USER_KEY)
  }

  function logout() {
    isAuthenticated.value = false
    currentUserId.value = ''
    clearSession()
    setToken(null)
    selectedFieldId.value = fieldsList.value[0]?.id ?? ''
    selectedTaskId.value = tasksList.value[0]?.id ?? ''
    searchTerm.value = ''
    activeCrop.value = ''
    activeStatus.value = ''
    activeAgronomist.value = ''
  }

  async function bootstrapFromApi() {
    const data = await apiBootstrap()
    fieldsList.value = data.fields as Field[]
    tasksList.value = data.tasks as Task[]
    if (data.settings && Object.keys(data.settings).length) {
      settings.value = { ...settings.value, ...(data.settings as unknown as AppSettings) }
      saveSettings(settings.value)
      applyTheme(settings.value.theme)
    }
    riskRules.value = { ...defaultRiskRules, ...(data.riskRules as unknown as RiskRules) }
    if (data.importRecords?.length) importRecordsList.value = data.importRecords as ImportRecord[]
    if (data.exportRecords?.length) exportRecordsList.value = data.exportRecords as ExportRecord[]
    if (data.user) {
      const u = data.user as { id: string; name: string; role: Role; login: string; email?: string; phone?: string }
      const mapped: User = {
        id: u.id,
        name: u.name,
        role: u.role,
        login: u.login,
        email: u.email ?? '',
        phone: u.phone ?? '',
        status: 'Активен',
        password: ''
      }
      const idx = usersList.value.findIndex((item) => item.id === mapped.id)
      if (idx >= 0) usersList.value[idx] = { ...usersList.value[idx], ...mapped, password: usersList.value[idx].password }
      else usersList.value = [mapped, ...usersList.value.filter((item) => item.login !== mapped.login)]
      currentUserId.value = mapped.id
    }
    if (fieldsList.value.length && !fieldsList.value.some((f) => f.id === selectedFieldId.value)) {
      selectedFieldId.value = fieldsList.value[0].id
    }
    persistFields()
  }

  async function initApp() {
    startNightModeWatcher()
    apiOnline.value = await apiHealth()
    await ensureSettlementsLoaded()
    if (apiOnline.value && getToken()) {
      try {
        await bootstrapFromApi()
        isAuthenticated.value = true
      } catch {
        setToken(null)
        isAuthenticated.value = localStorage.getItem(AUTH_KEY) === 'true' && !!loadStoredUserId()
      }
    }
  }

  async function login(loginValue: string, password: string) {
    apiOnline.value = await apiHealth()
    if (apiOnline.value) {
      try {
        const data = await apiLogin(loginValue.trim(), password)
        setToken(data.token)
        await bootstrapFromApi()
        isAuthenticated.value = true
        persistSession(currentUserId.value || 'admin')
        return true
      } catch {
        // fallback to local demo users
      }
    }

    const user = usersList.value.find((item) => item.login === loginValue.trim() && item.password === password)
    if (user) {
      isAuthenticated.value = true
      currentUserId.value = user.id
      persistSession(user.id)
      return true
    }
    return false
  }

  function selectField(id: string) {
    selectedFieldId.value = id
  }

  function setShowNdviLayer(value: boolean) {
    showNdviLayer.value = value
    localStorage.setItem('agro-ndvi-layer', value ? 'true' : 'false')
  }

  function openFieldOnMap(fieldId: string) {
    selectField(fieldId)
    mapFocusFieldId.value = fieldId
    mapFocusToken.value += 1
    window.setTimeout(() => {
      if (mapFocusFieldId.value === fieldId) {
        mapFocusFieldId.value = null
      }
    }, 3200)
  }

  function setShowScoutingLayer(value: boolean) {
    showScoutingLayer.value = value
    localStorage.setItem('agro-scout-layer', value ? 'true' : 'false')
  }

  function scoutsForField(fieldId: string) {
    return scoutReportsList.value
      .filter((item) => item.fieldId === fieldId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  function latestArrival(fieldId: string) {
    return fieldArrivalsList.value
      .filter((item) => item.fieldId === fieldId)
      .sort((a, b) => b.at.localeCompare(a.at))[0]
  }

  async function addScoutReport(payload: {
    fieldId: string
    lat: number
    lng: number
    kind: ScoutReport['kind']
    comment: string
    photoDataUrl?: string
  }) {
    const field = fieldsList.value.find((item) => item.id === payload.fieldId)
    if (!field) return null

    const report: ScoutReport = {
      id: `scout-${Date.now()}`,
      fieldId: payload.fieldId,
      fieldName: field.name,
      lat: payload.lat,
      lng: payload.lng,
      kind: payload.kind,
      comment: payload.comment,
      photoDataUrl: payload.photoDataUrl,
      author: currentUser.value?.name ?? 'Агроном',
      createdAt: new Date().toISOString()
    }

    scoutReportsList.value = [report, ...scoutReportsList.value]
    saveScoutReports(scoutReportsList.value)
    flashSaveMessage('Отметка обхода сохранена')
    return report
  }

  async function markFieldArrival(fieldId: string) {
    const field = fieldsList.value.find((item) => item.id === fieldId)
    if (!field?.coordinates?.length) {
      flashSaveMessage('У поля нет контура на карте')
      return false
    }

    try {
      const position = await requestCurrentPosition()
      if (!pointInPolygon(position, field.coordinates)) {
        flashSaveMessage('GPS: вы вне контура поля — подъезжайте ближе')
        return false
      }

      const arrival: FieldArrival = {
        fieldId,
        userId: currentUserId.value,
        userName: currentUser.value?.name ?? 'Сотрудник',
        lat: position[0],
        lng: position[1],
        at: new Date().toISOString()
      }

      fieldArrivalsList.value = [arrival, ...fieldArrivalsList.value.filter((item) => !(item.fieldId === fieldId && item.userId === currentUserId.value))]
      saveFieldArrivals(fieldArrivalsList.value)
      flashSaveMessage(`Прибытие на поле №${field.number} зафиксировано`)
      return true
    } catch (error) {
      flashSaveMessage(error instanceof Error ? error.message : 'Не удалось получить GPS')
      return false
    }
  }

  async function verifyOnField(fieldId: string) {
    const field = fieldsList.value.find((item) => item.id === fieldId)
    if (!field?.coordinates?.length) {
      return { ok: false as const, message: 'У поля нет контура' }
    }

    try {
      const position = await requestCurrentPosition()
      if (!pointInPolygon(position, field.coordinates)) {
        return { ok: false as const, message: 'Закрыть задачу можно только стоя на поле (GPS)' }
      }
      return { ok: true as const, position }
    } catch (error) {
      return {
        ok: false as const,
        message: error instanceof Error ? error.message : 'Разрешите GPS для подтверждения'
      }
    }
  }

  function selectTask(id: string) {
    selectedTaskId.value = id
  }

  async function loadWeather(force = false) {
    if (weatherLoading.value) return
    weatherLoading.value = true
    weatherError.value = ''

    const region = selectedRegion.value
    let lastError = ''

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await fetchWeather(region.lat, region.lng, region.name)
        weather.value = result
        saveWeatherCache(result)
        weatherLoading.value = false
        return
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Ошибка сети'
        if (attempt < 2) {
          await new Promise((resolve) => window.setTimeout(resolve, 800 * (attempt + 1)))
        }
      }
    }

    weatherLoading.value = false
    if (!force && weather.value.station && weather.value.station.includes('Open-Meteo')) {
      weatherError.value = `${lastError}. Показан последний успешный прогноз.`
      return
    }

    const cached = loadWeatherCache<typeof initialWeather | null>(null)
    if (cached) {
      weather.value = cached
      weatherError.value = `${lastError}. Показан сохранённый прогноз.`
    } else {
      weather.value = { ...initialWeather, station: `${region.name} · демо-режим` }
      weatherError.value = `${lastError}. Показаны демо-данные.`
    }
  }

  function selectRegion(id: string) {
    selectedRegionId.value = id
    localStorage.setItem(REGION_KEY, id)
    loadWeather()
  }

  function unlockNightAchievementIfNeeded() {
    if (settings.value.autoNightMap && isNightHours() && !settings.value.nightMapUnlocked) {
      settings.value = { ...settings.value, nightMapUnlocked: true }
      saveSettings(settings.value)
      flashSaveMessage('Ночной режим карты — засчитано')
    }
  }

  function tickNightMode() {
    const nowNight = isNightHours()
    if (nowNight && !wasNight) {
      mapLayerManual.value = false
    }
    wasNight = nowNight
    nightModeActive.value = nowNight
    if (nowNight) unlockNightAchievementIfNeeded()
  }

  function startNightModeWatcher() {
    tickNightMode()
    unlockNightAchievementIfNeeded()
    nightWatchTimer = window.setInterval(tickNightMode, 30_000)
  }

  function setMapBaseLayer(layer: BaseLayerId) {
    mapBaseLayer.value = layer
    mapLayerManual.value = true
    localStorage.setItem('agro-base-layer', layer)
  }

  function setShowCropColors(value: boolean) {
    showCropColors.value = value
    localStorage.setItem('agro-crop-colors', value ? 'true' : 'false')
  }

  function updateSettings(partial: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...partial }
    saveSettings(settings.value)
    applyTheme(settings.value.theme)
    if (apiOnline.value && getToken()) {
      apiUpdateSettings(settings.value as unknown as Record<string, unknown>).catch(() => {})
    }
    flashSaveMessage('Настройки сохранены')
  }

  async function updateRiskRules(partial: Partial<RiskRules>) {
    riskRules.value = { ...riskRules.value, ...partial }
    if (apiOnline.value && getToken()) {
      try {
        riskRules.value = { ...riskRules.value, ...(await apiUpdateRiskRules(riskRules.value as unknown as Record<string, unknown>)) as unknown as RiskRules }
      } catch {
        // keep local values
      }
    }
    flashSaveMessage('Правила рисков сохранены')
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    if (apiOnline.value && getToken()) {
      try {
        return await apiChangePassword(currentPassword, newPassword)
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : 'Ошибка смены пароля' }
      }
    }

    const user = currentUser.value
    if (!user || user.password !== currentPassword) {
      return { ok: false, message: 'Текущий пароль неверный' }
    }
    if (newPassword.length < 4) {
      return { ok: false, message: 'Новый пароль должен быть не короче 4 символов' }
    }
    usersList.value = usersList.value.map((item) =>
      item.id === user.id ? { ...item, password: newPassword } : item
    )
    persistUsers(usersList.value)
    flashSaveMessage('Пароль обновлён')
    return { ok: true, message: 'Пароль успешно изменён' }
  }

  function dismissNotification(id: string) {
    if (!dismissedNotificationIds.value.includes(id)) {
      dismissedNotificationIds.value = [...dismissedNotificationIds.value, id]
      localStorage.setItem(DISMISSED_NOTIF_KEY, JSON.stringify(dismissedNotificationIds.value))
    }
  }

  function restoreNotifications() {
    dismissedNotificationIds.value = []
    localStorage.removeItem(DISMISSED_NOTIF_KEY)
  }

  function createFieldCoordinates(index: number): [number, number][] {
    const row = index % 10
    const col = Math.floor(index / 10)
    const baseLat = 55.65 + row * 0.014
    const baseLng = 37.45 + col * 0.018
    const size = 0.006 + (index % 4) * 0.0014
    return [
      [baseLat - size * 0.5, baseLng - size],
      [baseLat - size * 0.3, baseLng + size],
      [baseLat + size * 0.6, baseLng + size * 0.8],
      [baseLat + size, baseLng - size * 0.4]
    ]
  }

  async function addField(
    fieldData: {
      name: string
      crop: string
      area: number
      agronomist: string
      status: string
      sowDate: string
      yield: number
    },
    coordinates?: [number, number][]
  ) {
    const payload = {
      name: fieldData.name,
      crop: fieldData.crop,
      area: fieldData.area,
      agronomist: fieldData.agronomist,
      status: fieldData.status,
      sowDate: fieldData.sowDate,
      yield: fieldData.yield,
      coordinates: coordinates ?? createFieldCoordinates(fieldsList.value.length),
      history: [
        { year: 2026, type: 'Создание', description: 'Поле добавлено в систему', value: fieldData.crop }
      ],
      yieldHistory: [{ year: 2025, yield: fieldData.yield }]
    }

    if (apiOnline.value && getToken()) {
      try {
        const created = (await apiCreateField(payload)) as Field
        fieldsList.value = [...fieldsList.value, created]
        selectedFieldId.value = created.id
        persistFields()
        flashSaveMessage('Поле добавлено')
        return created
      } catch {
        // fallback below
      }
    }

    const newIndex = fieldsList.value.length
    const newField: Field = {
      id: `field-${Date.now()}`,
      number: newIndex + 1,
      name: fieldData.name,
      crop: fieldData.crop as Field['crop'],
      area: fieldData.area,
      status: fieldData.status as Field['status'],
      sowDate: fieldData.sowDate,
      agronomist: fieldData.agronomist,
      yield: fieldData.yield,
      coordinates: payload.coordinates,
      fieldCode: `FD-${1000 + newIndex}`,
      humidity: 45,
      healthIndex: 78,
      history: payload.history,
      yieldHistory: payload.yieldHistory
    }
    fieldsList.value = [...fieldsList.value, newField]
    selectedFieldId.value = newField.id
    persistFields()
    flashSaveMessage('Поле добавлено')
    return newField
  }

  async function updateField(id: string, payload: Partial<Field>) {
    const index = fieldsList.value.findIndex((item) => item.id === id)
    if (index === -1) return false

    if (apiOnline.value && getToken()) {
      try {
        const updated = (await apiPatchField(id, payload as Record<string, unknown>)) as Field
        fieldsList.value = fieldsList.value.map((field) => (field.id === id ? { ...field, ...updated } : field))
        persistFields()
        flashSaveMessage('Изменения сохранены')
        return true
      } catch {
        // fallback below
      }
    }

    fieldsList.value = fieldsList.value.map((field) => (field.id === id ? { ...field, ...payload } : field))
    persistFields()
    flashSaveMessage('Изменения сохранены')
    return true
  }

  async function completeTask(taskId: string) {
    const task = tasksList.value.find((item) => item.id === taskId)
    if (!task) return false

    const gpsCheck = await verifyOnField(task.fieldId)
    if (!gpsCheck.ok) {
      flashSaveMessage(gpsCheck.message)
      return false
    }

    if (apiOnline.value && getToken()) {
      try {
        const updated = (await apiPatchTask(taskId, 'Выполнено')) as Task
        tasksList.value = tasksList.value.map((task) => (task.id === taskId ? { ...task, ...updated } : task))
        flashSaveMessage('Задача выполнена')
        return true
      } catch {
        // fallback
      }
    }
    tasksList.value = tasksList.value.map((task) =>
      task.id === taskId ? { ...task, status: 'Выполнено' } : task
    )
    flashSaveMessage('Задача выполнена')
    return true
  }

  async function loadFieldChangelog(fieldId: string) {
    if (apiOnline.value && getToken()) {
      try {
        fieldChangelog.value = (await apiFieldChangelog(fieldId)) as FieldChangeLog[]
        return fieldChangelog.value
      } catch {
        fieldChangelog.value = []
        return []
      }
    }
    fieldChangelog.value = []
    return []
  }

  async function previewImportFile(file: File) {
    if (apiOnline.value && getToken()) {
      return apiPreviewImport(file)
    }
    const text = await file.text()
    const parsed = JSON.parse(text)
    const result = importFieldsFromJson(parsed, file.name)
    if (!result.ok) throw new Error(result.message)
    return { fileName: file.name, format: 'JSON', drafts: [] as ImportDraft[] }
  }

  async function confirmImport(payload: { fileName: string; format: string; drafts: ImportDraft[] }) {
    if (apiOnline.value && getToken()) {
      const result = await apiConfirmImport(payload)
      if (result.fields?.length) {
        fieldsList.value = [...fieldsList.value, ...(result.fields as Field[])]
        persistFields()
      }
      if (result.record) {
        importRecordsList.value = [result.record as ImportRecord, ...importRecordsList.value].slice(0, 20)
      }
      flashSaveMessage(`Импортировано полей: ${result.imported}`)
      const record: ImportRecord = {
        id: `imp-${Date.now()}`,
        file: payload.fileName,
        format: payload.format,
        status: `Импортировано ${result.imported} полей`,
        date: new Date().toLocaleString('ru-RU')
      }
      importRecordsList.value = [record, ...importRecordsList.value].slice(0, 20)
      saveImportRecords(importRecordsList.value)
      return result
    }
    return { imported: 0, fields: [] }
  }

  function importFieldsFromJson(raw: unknown, fileName: string) {
    let imported: Partial<Field>[] = []

    if (Array.isArray(raw)) {
      imported = raw as Partial<Field>[]
    } else if (raw && typeof raw === 'object' && 'features' in raw) {
      const features = (raw as { features: Array<{ geometry?: { coordinates?: number[][][] }; properties?: Record<string, unknown> }> }).features
      imported = features
        .filter((feature) => feature.geometry?.coordinates?.[0])
        .map((feature, index) => {
          const ring = feature.geometry!.coordinates![0]
          const coordinates = ring.map(([lng, lat]) => [lat, lng] as [number, number])
          const props = feature.properties ?? {}
          return {
            name: String(props.name ?? props.title ?? `Импорт ${index + 1}`),
            crop: (props.crop as Field['crop']) ?? 'Пшеница',
            area: Number(props.area ?? 50),
            agronomist: String(props.agronomist ?? agronomistOptions.value[0] ?? 'Иван Петров'),
            status: (props.status as Field['status']) ?? 'Активно',
            sowDate: String(props.sowDate ?? '01.04.2026'),
            yield: Number(props.yield ?? 6),
            coordinates
          }
        })
    } else if (raw && typeof raw === 'object' && 'fields' in raw) {
      imported = (raw as { fields: Partial<Field>[] }).fields
    }

    if (!imported.length) {
      return { ok: false, message: 'Файл не содержит полей для импорта' }
    }

    const newFields: Field[] = imported.map((item, index) => {
      const newIndex = fieldsList.value.length + index
      return {
        id: `field-${Date.now()}-${index}`,
        number: newIndex + 1,
        name: item.name ?? `Импорт ${newIndex + 1}`,
        crop: (item.crop as Field['crop']) ?? 'Пшеница',
        area: Number(item.area ?? 50),
        status: (item.status as Field['status']) ?? 'Активно',
        sowDate: String(item.sowDate ?? '01.04.2026'),
        agronomist: String(item.agronomist ?? agronomistOptions.value[0] ?? 'Иван Петров'),
        yield: Number(item.yield ?? 6),
        coordinates: item.coordinates ?? createFieldCoordinates(newIndex),
        fieldCode: `FD-${1000 + newIndex}`,
        humidity: 45,
        healthIndex: 78,
        history: [
          { year: 2026, type: 'Импорт', description: 'Поле загружено из файла', value: fileName }
        ],
        yieldHistory: [{ year: 2025, yield: Number(item.yield ?? 6) }]
      }
    })

    fieldsList.value = [...fieldsList.value, ...newFields]
    selectedFieldId.value = newFields[0]?.id ?? selectedFieldId.value
    persistFields()

    const record: ImportRecord = {
      id: `imp-${Date.now()}`,
      file: fileName,
      format: fileName.endsWith('.geojson') ? 'GeoJSON' : 'JSON',
      status: `Импортировано ${imported.length} полей`,
      date: new Date().toLocaleString('ru-RU')
    }
    importRecordsList.value = [record, ...importRecordsList.value].slice(0, 20)
    saveImportRecords(importRecordsList.value)
    return { ok: true, message: `Импортировано полей: ${imported.length}` }
  }

  function exportFields(format: 'json' | 'csv' | 'geojson') {
    const stamp = new Date().toISOString().slice(0, 10)
    let blob: Blob
    let fileName: string

    if (format === 'json') {
      fileName = `agro-fields-${stamp}.json`
      blob = new Blob([JSON.stringify(fieldsList.value, null, 2)], { type: 'application/json' })
    } else if (format === 'csv') {
      fileName = `agro-fields-${stamp}.csv`
      const header = 'id,number,name,crop,area,status,sowDate,agronomist,yield'
      const rows = fieldsList.value.map((field) =>
        [field.id, field.number, field.name, field.crop, field.area, field.status, field.sowDate, field.agronomist, field.yield]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    } else {
      fileName = `agro-fields-${stamp}.geojson`
      const geojson = {
        type: 'FeatureCollection',
        features: fieldsList.value.map((field) => ({
          type: 'Feature',
          properties: {
            id: field.id,
            number: field.number,
            name: field.name,
            crop: field.crop,
            area: field.area,
            status: field.status,
            agronomist: field.agronomist,
            yield: field.yield
          },
          geometry: {
            type: 'Polygon',
            coordinates: [field.coordinates.map(([lat, lng]) => [lng, lat])]
          }
        }))
      }
      blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' })
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)

    const record: ExportRecord = {
      id: `exp-${Date.now()}`,
      format: format.toUpperCase(),
      file: fileName,
      status: 'Готово',
      date: new Date().toLocaleString('ru-RU')
    }
    exportRecordsList.value = [record, ...exportRecordsList.value].slice(0, 20)
    saveExportRecords(exportRecordsList.value)
    if (apiOnline.value && getToken()) {
      apiLogExport(fileName, format.toUpperCase()).catch(() => {})
    }
    flashSaveMessage(`Экспорт ${fileName}`)
    return fileName
  }

  function addUser(payload: {
    name: string
    role: Role
    email: string
    phone: string
    login: string
    password: string
  }) {
    if (!isAdmin.value) return null

    const newUser: User = {
      id: `user-${usersList.value.length + 1}`,
      name: payload.name,
      role: payload.role,
      email: payload.email,
      phone: payload.phone,
      status: 'Активен',
      login: payload.login,
      password: payload.password
    }
    usersList.value = [...usersList.value, newUser]
    persistUsers(usersList.value)
    return newUser
  }

  return {
    isAuthenticated,
    currentUserId,
    currentUser,
    isAdmin,
    isAgronomist,
    isWorker,
    userRoleLabel,
    can,
    canRoute,
    selectedFieldId,
    selectedTaskId,
    activeCrop,
    activeStatus,
    activeAgronomist,
    searchTerm,
    showWeather,
    showTasksLayer,
    showEquipmentLayer,
    showHistoryLayer,
    showYieldLayer,
    showNdviLayer,
    showScoutingLayer,
    showCropColors,
    mapFocusFieldId,
    mapFocusToken,
    mapBaseLayer,
    effectiveMapBaseLayer,
    nightModeActive,
    showNightMapBadge,
    weather,
    weatherLoading,
    weatherError,
    selectedRegionId,
    selectedRegion,
    mapRegions,
    fields: fieldsList,
    users: usersList,
    equipment,
    tasks: tasksList,
    scoutReports: scoutReportsList,
    fieldArrivals: fieldArrivalsList,
    recommendations,
    riskIndexes,
    notifications,
    importRecords: importRecordsList,
    exportRecords: exportRecordsList,
    cropPalette,
    riskRules,
    fieldChangelog,
    apiOnline,
    selectedField,
    selectedTask,
    filteredFields,
    autocomplete,
    fieldCropOptions,
    fieldStatusOptions,
    agronomistOptions,
    analyticsSummary,
    settings,
    saveMessage,
    login,
    logout,
    initApp,
    bootstrapFromApi,
    selectField,
    selectTask,
    openFieldOnMap,
    setShowNdviLayer,
    setShowScoutingLayer,
    scoutsForField,
    latestArrival,
    addScoutReport,
    markFieldArrival,
    verifyOnField,
    loadWeather,
    selectRegion,
    setMapBaseLayer,
    setShowCropColors,
    dismissNotification,
    restoreNotifications,
    addField,
    updateField,
    completeTask,
    loadFieldChangelog,
    addUser,
    updateSettings,
    updateRiskRules,
    changePassword,
    previewImportFile,
    confirmImport,
    importFieldsFromJson,
    exportFields
  }
})
