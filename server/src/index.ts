import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth.js'
import fieldsRoutes from './routes/fields.js'
import tasksRoutes from './routes/tasks.js'
import importRoutes from './routes/import.js'
import settingsRoutes from './routes/settings.js'
import weatherRoutes from './routes/weather.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT ?? 3001)
const isProduction = process.env.NODE_ENV === 'production'
const distPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../dist')

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'agro-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/fields', fieldsRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/import', importRoutes)
app.use('/api/user', settingsRoutes)
app.use('/api/weather', weatherRoutes)

if (isProduction) {
  app.use(express.static(distPath, { index: false }))
  app.get('*', (_req, res, next) => {
    if (_req.path.startsWith('/api')) return next()
    res.sendFile(path.join(distPath, 'index.html'), (error) => {
      if (error) next(error)
    })
  })
}

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error)
  res.status(500).json({ error: error.message || 'Внутренняя ошибка сервера' })
})

app.listen(port, () => {
  console.log(`Agro API listening on http://localhost:${port}${isProduction ? ' (production)' : ''}`)
})
