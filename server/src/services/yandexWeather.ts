export interface WeatherForecastDto {
  day: string
  temp: string
  rain: string
  wind: string
  icon?: string
  rainMm?: number
  minTemp?: number
  maxTemp?: number
}

export interface WeatherMetricsDto {
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

export interface WeatherStateDto {
  temperature: string
  humidity: string
  pressure: string
  wind: string
  precipitation: string
  cloudiness: string
  station: string
  forecast: WeatherForecastDto[]
  updatedAt?: string
  currentIcon?: string
  metrics?: WeatherMetricsDto
}

interface YandexPart {
  temp?: number
  temp_min?: number
  temp_max?: number
  prec_mm?: number
  wind_speed?: number
  condition?: string
}

interface YandexForecast {
  date: string
  parts?: Record<string, YandexPart>
}

interface YandexResponse {
  fact?: {
    temp?: number
    humidity?: number
    pressure_mm?: number
    pressure_pa?: number
    wind_speed?: number
    condition?: string
    prec_mm?: number
  }
  forecasts?: YandexForecast[]
  info?: { tzinfo?: { name?: string } }
}

const CONDITION_LABELS: Record<string, string> = {
  clear: 'Ясно',
  'partly-cloudy': 'Переменная облачность',
  cloudy: 'Облачно',
  overcast: 'Пасмурно',
  drizzle: 'Морось',
  'light-rain': 'Небольшой дождь',
  rain: 'Дождь',
  'moderate-rain': 'Дождь',
  'heavy-rain': 'Сильный дождь',
  'continuous-heavy-rain': 'Сильный дождь',
  showers: 'Ливень',
  'wet-snow': 'Мокрый снег',
  'light-snow': 'Небольшой снег',
  snow: 'Снег',
  'snow-showers': 'Снегопад',
  hail: 'Град',
  thunderstorm: 'Гроза',
  'thunderstorm-with-rain': 'Гроза с дождём',
  'thunderstorm-with-hail': 'Гроза с градом',
  fog: 'Туман'
}

function num(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function tempLabel(value: number) {
  const rounded = Math.round(value)
  return rounded > 0 ? `+${rounded}°C` : `${rounded}°C`
}

function windLabel(speed: number) {
  return `${Math.round(speed ?? 0)} м/с`
}

function conditionLabel(condition?: string) {
  if (!condition) return '—'
  return CONDITION_LABELS[condition] ?? condition.replace(/-/g, ' ')
}

function conditionIcon(condition?: string): string {
  if (!condition) return 'partly'
  if (condition === 'clear') return 'clear'
  if (condition.includes('partly') || condition === 'cloudy' || condition === 'overcast') return 'partly'
  if (condition.includes('fog')) return 'fog'
  if (condition.includes('thunder')) return 'storm'
  if (condition.includes('snow')) return 'snow'
  if (condition.includes('shower') || condition.includes('heavy-rain')) return 'shower'
  if (condition.includes('rain') || condition.includes('drizzle')) return 'rain'
  return 'partly'
}

function dayLabel(dateStr: string, index: number, timezone: string) {
  if (index === 0) return 'Сегодня'
  if (index === 1) return 'Завтра'
  const date = new Date(`${dateStr}T12:00:00`)
  const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: timezone }).format(date)
  return weekday.charAt(0).toUpperCase() + weekday.slice(1)
}

function aggregateDay(forecast: YandexForecast) {
  const parts = Object.values(forecast.parts ?? {})
  let minTemp = Number.POSITIVE_INFINITY
  let maxTemp = Number.NEGATIVE_INFINITY
  let rainMm = 0
  let windMax = 0
  let condition = 'partly-cloudy'

  for (const part of parts) {
    if (part.temp_min != null) minTemp = Math.min(minTemp, part.temp_min)
    if (part.temp_max != null) maxTemp = Math.max(maxTemp, part.temp_max)
    if (part.temp != null && minTemp === Number.POSITIVE_INFINITY) {
      minTemp = Math.min(minTemp, part.temp)
      maxTemp = Math.max(maxTemp, part.temp)
    }
    rainMm += num(part.prec_mm)
    windMax = Math.max(windMax, num(part.wind_speed))
    if (part.condition && part.condition !== 'clear') {
      condition = part.condition
    }
  }

  if (!Number.isFinite(minTemp)) minTemp = 0
  if (!Number.isFinite(maxTemp)) maxTemp = minTemp

  const dayPart = forecast.parts?.day ?? forecast.parts?.day_short
  if (dayPart?.condition) condition = dayPart.condition

  return { minTemp, maxTemp, rainMm, windMax, condition }
}

export function mapYandexWeather(data: YandexResponse, regionName: string): WeatherStateDto {
  const fact = data.fact ?? {}
  const timezone = data.info?.tzinfo?.name ?? 'Europe/Moscow'
  const forecasts = (data.forecasts ?? []).slice(0, 7)

  const forecast: WeatherForecastDto[] = forecasts.map((item, index) => {
    const agg = aggregateDay(item)
    const maxRounded = Math.round(agg.maxTemp)
    const minRounded = Math.round(agg.minTemp)

    return {
      day: dayLabel(item.date, index, timezone),
      temp: `${maxRounded > 0 ? '+' : ''}${maxRounded}° / ${minRounded}°`,
      rain: `${agg.rainMm.toFixed(1)} мм`,
      rainMm: agg.rainMm,
      minTemp: agg.minTemp,
      maxTemp: agg.maxTemp,
      wind: windLabel(agg.windMax),
      icon: conditionIcon(agg.condition)
    }
  })

  const tomorrow = forecast[1]
  const precipitation = num(fact.prec_mm)
  const updatedAt = new Intl.DateTimeFormat('ru-RU', {
    timeZone: timezone,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())

  return {
    temperature: tempLabel(num(fact.temp)),
    humidity: `${Math.round(num(fact.humidity))}%`,
    pressure: `${Math.round(num(fact.pressure_mm))} мм рт.ст.`,
    wind: windLabel(num(fact.wind_speed)),
    precipitation: `${precipitation.toFixed(1)} мм`,
    cloudiness: conditionLabel(fact.condition),
    station: `${regionName} · Яндекс Погода · ${timezone}`,
    forecast,
    updatedAt,
    currentIcon: conditionIcon(fact.condition),
    metrics: {
      temperature: num(fact.temp),
      humidity: num(fact.humidity),
      pressure: num(fact.pressure_pa, num(fact.pressure_mm) * 1.33),
      windSpeed: num(fact.wind_speed),
      precipitation,
      tomorrowRain: tomorrow?.rainMm ?? 0,
      weekRain: forecast.reduce((sum, day) => sum + (day.rainMm ?? 0), 0),
      minTempTomorrow: tomorrow?.minTemp ?? num(fact.temp),
      maxTempTomorrow: tomorrow?.maxTemp ?? num(fact.temp)
    }
  }
}

export async function fetchYandexWeather(lat: number, lng: number, regionName: string, apiKey: string) {
  const url = new URL('https://api.weather.yandex.ru/v2/forecast')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('limit', '7')
  url.searchParams.set('lang', 'ru_RU')
  url.searchParams.set('extra', 'true')

  const response = await fetch(url.toString(), {
    headers: {
      'X-Yandex-Weather-Key': apiKey
    },
    signal: AbortSignal.timeout(15000)
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Яндекс Погода недоступна (${response.status})${text ? `: ${text.slice(0, 120)}` : ''}`)
  }

  const data = (await response.json()) as YandexResponse
  return mapYandexWeather(data, regionName)
}
