import { Router } from 'express'
import { fetchYandexWeather } from '../services/yandexWeather.js'

const router = Router()

router.get('/', async (req, res) => {
  const apiKey = process.env.YANDEX_WEATHER_KEY
  if (!apiKey) {
    res.status(503).json({ error: 'YANDEX_WEATHER_KEY не задан на сервере' })
    return
  }

  const lat = Number(req.query.lat)
  const lng = Number(req.query.lng)
  const name = typeof req.query.name === 'string' && req.query.name.trim() ? req.query.name.trim() : 'Регион'

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: 'Параметры lat и lng обязательны' })
    return
  }

  try {
    const weather = await fetchYandexWeather(lat, lng, name, apiKey)
    res.json(weather)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка погодного сервиса'
    res.status(502).json({ error: message })
  }
})

export default router
