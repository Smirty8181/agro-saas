export type Crop = 'Пшеница' | 'Кукуруза' | 'Подсолнечник' | 'Соя'
export type FieldStatus = 'Активно' | 'Внимание' | 'Завершено'
export type TaskStatus = 'Выполнено' | 'В работе' | 'Запланировано'
export type Role = 'Агроном' | 'Рабочий' | 'Администратор'
export type EquipmentStatus = 'Работает' | 'На обслуживании' | 'Неактивна'

export interface FieldHistoryItem {
  year: number
  type: string
  description: string
  value?: string
}

export interface Field {
  id: string
  dbId?: string
  number: number
  name: string
  crop: Crop
  area: number
  status: FieldStatus
  sowDate: string
  agronomist: string
  yield: number
  coordinates: [number, number][]
  fieldCode: string
  humidity: number
  healthIndex: number
  history: FieldHistoryItem[]
  yieldHistory: { year: number; yield: number }[]
}

export interface User {
  id: string
  name: string
  role: Role
  email: string
  phone: string
  status: string
  login: string
  password: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  number: string
  status: EquipmentStatus
  lastService: string
  nextService: string
}

export interface Task {
  id: string
  dbId?: string
  fieldId: string
  fieldName: string
  assignee: string
  type: string
  date: string
  priority: string
  status: TaskStatus
}

export type ScoutKind = 'weed' | 'pest' | 'disease'

export interface ScoutReport {
  id: string
  fieldId: string
  fieldName: string
  lat: number
  lng: number
  kind: ScoutKind
  comment: string
  photoDataUrl?: string
  author: string
  createdAt: string
}

export interface FieldArrival {
  fieldId: string
  userId: string
  userName: string
  lat: number
  lng: number
  at: string
}

export interface WeatherForecast {
  day: string
  temp: string
  rain: string
  wind: string
  icon?: string
  rainMm?: number
  minTemp?: number
  maxTemp?: number
}

export interface WeatherMetrics {
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  precipitation: number
  tomorrowRain: number
  weekRain: number
  minTempTomorrow: number
  maxTempTomorrow: number
}

export interface WeatherState {
  temperature: string
  humidity: string
  pressure: string
  wind: string
  precipitation: string
  cloudiness: string
  station: string
  forecast: WeatherForecast[]
  updatedAt?: string
  currentIcon?: string
  metrics?: WeatherMetrics
}

export interface AgroRecommendation {
  id: string
  icon: 'check' | 'alertTriangle' | 'slash' | 'info'
  text: string
}

export interface RiskIndex {
  id: string
  title: string
  value: string
  level: 'low' | 'medium' | 'high'
  color: string
  hint: string
}

export interface AppNotification {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'danger'
  type: 'weather' | 'task' | 'field' | 'equipment' | 'system'
  actionPath?: string
}

export interface ImportRecord {
  id: string
  file: string
  format: string
  status: string
  date: string
}

export interface ExportRecord {
  id: string
  format: string
  file: string
  status: string
  date: string
}

export interface RiskRules {
  rainWarningMm: number
  rainDangerMm: number
  soilHumidityLow: number
  soilHumidityHigh: number
  windMaxMs: number
  frostTempC: number
  weekRainHigh: number
}

export interface FieldChangeLog {
  id: string
  userName: string
  changedAt: string
  property: string
  oldValue: string | null
  newValue: string | null
  changeType: string
}

export const defaultRiskRules: RiskRules = {
  rainWarningMm: 3,
  rainDangerMm: 8,
  soilHumidityLow: 38,
  soilHumidityHigh: 70,
  windMaxMs: 12,
  frostTempC: 0,
  weekRainHigh: 20
}

export const cropPalette: Record<Crop, string> = {
  Пшеница: '#F2C94C',
  Кукуруза: '#6FCF97',
  Подсолнечник: '#F2994A',
  Соя: '#B7E4A9'
}

const cropNames: Crop[] = ['Пшеница', 'Кукуруза', 'Подсолнечник', 'Соя']
const agronomists = ['Иван Петров', 'Мария Сидорова', 'Олег Кузьмин', 'Наталья Орлова', 'Дмитрий Зайцев']
const fieldNames = ['Южный участок', 'Северный блок', 'Западный кордон', 'Восточная лужайка', 'Тихий сектор']
const taskTypes = ['Посев', 'Удобрения', 'Обработка', 'Уборка урожая', 'Техобслуживание', 'Опрыскивание']
const taskStatuses: TaskStatus[] = ['Выполнено', 'В работе', 'Запланировано']
const priorities = ['Высокий', 'Средний', 'Низкий']
const roles: Role[] = ['Агроном', 'Рабочий', 'Администратор']
const equipmentTypes = ['Трактор', 'Комбайн', 'Опрыскиватель', 'Разбрасыватель', 'Плуг']
const equipmentNames = ['John Deere 8R', 'CLAAS Lexion', 'Amazone ZA-TS', 'Fendt 900', 'New Holland T7', 'Case IH Magnum']
const statusOptions: EquipmentStatus[] = ['Работает', 'На обслуживании', 'Неактивна']
const names = ['Алексей', 'Светлана', 'Егор', 'Полина', 'Максим', 'Оксана', 'Николай', 'Екатерина', 'Руслан', 'Анна', 'Роман', 'Виктория']

function formatPhone(index: number) {
  return `+7 9${Math.floor(100000000 + index * 1234567).toString().slice(0, 9)}`
}

function createPolygon(index: number): [number, number][] {
  const row = index % 10
  const col = Math.floor(index / 10)
  const baseLat = 55.65 + row * 0.014
  const baseLng = 37.45 + col * 0.018
  const size = 0.006 + ((index % 4) * 0.0014)
  return [
    [baseLat - size * 0.6, baseLng - size],
    [baseLat - size * 0.4, baseLng + size],
    [baseLat + size * 0.6, baseLng + size * 1.1],
    [baseLat + size, baseLng - size * 0.5]
  ]
}

function dateFromOffset(index: number) {
  const day = 2 + (index % 20)
  const month = 3 + Math.floor(index / 20)
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.2026`
}

export const fields: Field[] = Array.from({ length: 50 }, (_, idx) => {
  const crop = cropNames[idx % cropNames.length]
  const status = idx % 3 === 0 ? 'Активно' : idx % 3 === 1 ? 'Внимание' : 'Завершено'
  const area = Number((55 + (idx % 8) * 11 + (idx % 5) * 2.3).toFixed(1))
  const agronomist = agronomists[idx % agronomists.length]
  const yieldValue = Number((5.2 + (idx % 4) * 0.9 + (idx % 3) * 0.25).toFixed(1))

  return {
    id: `field-${idx + 1}`,
    number: idx + 1,
    name: `${fieldNames[idx % fieldNames.length]} ${idx + 1}`,
    crop,
    area,
    status,
    sowDate: dateFromOffset(idx),
    agronomist,
    yield: yieldValue,
    coordinates: createPolygon(idx),
    fieldCode: `FD-${1000 + idx}`,
    humidity: 36 + (idx % 8) * 3,
    healthIndex: 72 + (idx % 6) * 4,
    history: [
      { year: 2023, type: 'Уборка', description: 'Урожайность 6.8 т/га', value: `Культура ${crop}` },
      { year: 2024, type: 'Удобрения', description: 'Внесено 42 кг азота', value: 'Оптимально' },
      { year: 2025, type: 'Обработка', description: 'Применено фунгицидов', value: 'Безопасно' },
      { year: 2026, type: 'Посев', description: 'Высеяно семян сорта А-35', value: `Площадь ${area} га` }
    ],
    yieldHistory: [
      { year: 2022, yield: Number((4.8 + (idx % 4) * 0.2).toFixed(1)) },
      { year: 2023, yield: Number((5.8 + (idx % 4) * 0.3).toFixed(1)) },
      { year: 2024, yield: Number((6.4 + (idx % 4) * 0.35).toFixed(1)) },
      { year: 2025, yield: Number((6.9 + (idx % 4) * 0.4).toFixed(1)) }
    ]
  }
})

export const tasks: Task[] = fields.flatMap((field, idx) => {
  const group = idx % 3
  return Array.from({ length: 2 }, (_, sub) => {
    const type = taskTypes[(idx + sub) % taskTypes.length]
    const assignee = names[(idx + sub) % names.length] + ' ' + ['Иванов', 'Петров', 'Смирнова', 'Крылов', 'Захарова'][(idx + sub) % 5]
    return {
      id: `task-${idx * 2 + sub + 1}`,
      fieldId: field.id,
      fieldName: field.name,
      assignee,
      type,
      date: dateFromOffset(idx + sub + 1),
      priority: priorities[(idx + sub) % priorities.length],
      status: taskStatuses[(idx + sub + group) % taskStatuses.length]
    }
  })
})

export const users: User[] = (() => {
  const generated = Array.from({ length: 20 }, (_, idx) => {
    const firstName = names[idx % names.length]
    const lastName = ['Петров', 'Соколова', 'Иванова', 'Лебедев', 'Семенова'][idx % 5]
    const role = idx === 0 ? 'Администратор' : roles[(idx % (roles.length - 1)) + 1]
    const login = idx === 0 ? 'admin' : `${firstName.toLowerCase()}${idx + 1}`
    return {
      id: `user-${idx + 1}`,
      name: `${firstName} ${lastName}`,
      role,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@diploom.agro`,
      phone: formatPhone(idx),
      status: idx % 4 === 0 ? 'Активен' : 'Временно недоступен',
      login,
      password: idx === 0 ? 'admin' : 'agro2026'
    } satisfies User
  })

  const demoLogins = new Set(['admin', 'agronom', 'worker'])
  const demos: User[] = [
    {
      id: 'demo-admin',
      name: 'Администратор Системы',
      role: 'Администратор',
      email: 'admin@diploom.agro',
      phone: '+7 (900) 000-00-01',
      status: 'Активен',
      login: 'admin',
      password: 'admin'
    },
    {
      id: 'demo-agronom',
      name: 'Иван Агрономов',
      role: 'Агроном',
      email: 'agronom@diploom.agro',
      phone: '+7 (900) 000-00-02',
      status: 'Активен',
      login: 'agronom',
      password: 'agro2026'
    },
    {
      id: 'demo-worker',
      name: 'Пётр Бригадир',
      role: 'Рабочий',
      email: 'worker@diploom.agro',
      phone: '+7 (900) 000-00-03',
      status: 'Активен',
      login: 'worker',
      password: 'agro2026'
    }
  ]

  return [...demos, ...generated.filter((user) => !demoLogins.has(user.login))]
})()

export const equipment: Equipment[] = Array.from({ length: 15 }, (_, idx) => {
  const name = equipmentNames[idx % equipmentNames.length]
  const type = equipmentTypes[idx % equipmentTypes.length]
  const status = statusOptions[idx % statusOptions.length]
  return {
    id: `equip-${idx + 1}`,
    name,
    type,
    number: `AG-${470 + idx}`,
    status,
    lastService: dateFromOffset(idx + 2),
    nextService: dateFromOffset(idx + 5)
  }
})

export const weather: WeatherState = {
  temperature: '+18°C',
  humidity: '62%',
  pressure: '1014 hPa',
  wind: '6 м/с',
  precipitation: '0.8 мм',
  cloudiness: 'Переменная облачность',
  station: 'Метеостанция «Золотое поле»',
  forecast: [
    { day: 'Сегодня', temp: '+18', rain: '0 мм', wind: '5 м/с' },
    { day: 'Завтра', temp: '+16', rain: '2 мм', wind: '7 м/с' },
    { day: 'Пн', temp: '+19', rain: '0 мм', wind: '4 м/с' },
    { day: 'Вт', temp: '+21', rain: '0 мм', wind: '5 м/с' },
    { day: 'Ср', temp: '+18', rain: '4 мм', wind: '6 м/с' },
    { day: 'Чт', temp: '+17', rain: '9 мм', wind: '7 м/с' },
    { day: 'Пт', temp: '+20', rain: '1 мм', wind: '5 м/с' }
  ]
}

export const recommendations = [
  { icon: 'check', text: 'Благоприятные условия для посева.' },
  { icon: 'alertTriangle', text: 'Ожидаются осадки через 24 часа.' },
  { icon: 'slash', text: 'Не рекомендуется внесение удобрений.' },
  { icon: 'check', text: 'Оптимальные условия для уборки урожая.' },
  { icon: 'alertTriangle', text: 'Высокий риск грибковых заболеваний.' }
]

export const riskIndexes = [
  { title: 'Риск засухи', value: 'Низкий', color: 'bg-emerald-100 text-emerald-700' },
  { title: 'Риск переувлажнения', value: 'Средний', color: 'bg-amber-100 text-amber-700' },
  { title: 'Риск заморозков', value: 'Низкий', color: 'bg-emerald-100 text-emerald-700' },
  { title: 'Риск заболеваний', value: 'Высокий', color: 'bg-rose-100 text-rose-700' }
]

export const notifications = [
  { id: 'n1', title: 'Завтра ожидается дождь', description: 'Оповещение по полю 17' },
  { id: 'n2', title: 'Необходимо завершить уборку', description: 'Поле 05, срочный выезд' },
  { id: 'n3', title: 'Просрочено задание', description: 'Фуражирование на участке 12' },
  { id: 'n4', title: 'Выполнен импорт данных', description: 'Обновлены границы 50 полей' },
  { id: 'n5', title: 'Создан новый отчет', description: 'План урожайности на 2026 год' }
]

export const importRecords: ImportRecord[] = [
  { id: 'i1', file: 'fields.geojson', format: 'GeoJSON', status: 'Успешно', date: '28.05.2026' },
  { id: 'i2', file: 'south_fields.kml', format: 'KML', status: 'Успешно', date: '21.05.2026' },
  { id: 'i3', file: 'export_2026.geojson', format: 'GeoJSON', status: 'Успешно', date: '14.05.2026' }
]

export const exportRecords: ExportRecord[] = [
  { id: 'e1', format: 'PDF', file: 'report_may.pdf', status: 'Сформирован', date: '30.05.2026' },
  { id: 'e2', format: 'Excel', file: 'fields_analytics.xlsx', status: 'Сформирован', date: '26.05.2026' },
  { id: 'e3', format: 'GeoJSON', file: 'fields_export.geojson', status: 'Сформирован', date: '19.05.2026' }
]
