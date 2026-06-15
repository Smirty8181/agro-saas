import bcrypt from 'bcryptjs'
import { pool, query } from './pool.js'

function createPolygon(index: number): [number, number][] {
  const row = index % 10
  const col = Math.floor(index / 10)
  const baseLat = 55.65 + row * 0.014
  const baseLng = 37.45 + col * 0.018
  const size = 0.006 + (index % 4) * 0.0014
  return [
    [baseLat - 0.6 * size, baseLng - size],
    [baseLat - 0.4 * size, baseLng + size],
    [baseLat + 0.6 * size, baseLng + 1.1 * size],
    [baseLat + size, baseLng - 0.5 * size]
  ]
}

function dateFromOffset(index: number) {
  const day = 2 + (index % 20)
  const month = 3 + Math.floor(index / 20)
  return `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.2026`
}

const crops = ['Пшеница', 'Кукуруза', 'Подсолнечник', 'Соя']
const agronomists = ['Иван Петров', 'Мария Сидорова', 'Олег Кузьмин', 'Наталья Орлова', 'Дмитрий Зайцев']
const fieldNames = ['Южный участок', 'Северный блок', 'Западный кордон', 'Восточная лужайка', 'Тихий сектор']
const taskTypes = ['Посев', 'Удобрения', 'Обработка', 'Уборка урожая', 'Техобслуживание', 'Опрыскивание']
const taskStatuses = ['Выполнено', 'В работе', 'Запланировано']
const priorities = ['Высокий', 'Средний', 'Низкий']
const names = ['Алексей', 'Светлана', 'Егор', 'Полина', 'Максим']

async function seed() {
  const { rows: existing } = await query('SELECT COUNT(*)::int AS count FROM users')
  if (existing[0].count > 0) {
    console.log('Database already seeded')
    await pool.end()
    return
  }

  const adminHash = await bcrypt.hash('admin', 10)
  const userHash = await bcrypt.hash('agro2026', 10)

  const { rows: adminRows } = await query<{ id: string }>(
    `INSERT INTO users (login, password_hash, name, role, email, phone, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    ['admin', adminHash, 'Администратор Системы', 'Администратор', 'admin@diploom.agro', '+79000000000', 'Активен']
  )
  const adminId = adminRows[0].id

  await query(
    `INSERT INTO users (login, password_hash, name, role, email, phone, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    ['agronom1', userHash, 'Иван Петров', 'Агроном', 'ivan@diploom.agro', '+79001112233', 'Активен']
  )

  const defaultSettings = {
    theme: 'light',
    companyName: 'Diploom Агрохолдинг',
    notifyEmail: true,
    notifySms: false,
    notifyWeather: true,
    notifyTasks: true,
    compactMobile: false
  }

  const defaultRiskRules = {
    rainWarningMm: 3,
    rainDangerMm: 8,
    soilHumidityLow: 38,
    soilHumidityHigh: 70,
    windMaxMs: 12,
    frostTempC: 0,
    weekRainHigh: 20
  }

  await query(`INSERT INTO user_settings (user_id, settings) VALUES ($1, $2)`, [adminId, JSON.stringify(defaultSettings)])
  await query(`INSERT INTO risk_rules (user_id, rules) VALUES ($1, $2)`, [adminId, JSON.stringify(defaultRiskRules)])

  const fieldIds: string[] = []

  for (let idx = 0; idx < 50; idx++) {
    const crop = crops[idx % crops.length]
    const area = Number((55 + (idx % 8) * 11 + (idx % 5) * 2.3).toFixed(1))
    const legacyId = `field-${idx + 1}`
    const { rows } = await query<{ id: string }>(
      `INSERT INTO fields (
        legacy_id, number, name, crop, area, status, sow_date, agronomist, yield,
        coordinates, field_code, humidity, health_index, history, yield_history
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
      [
        legacyId,
        idx + 1,
        `${fieldNames[idx % fieldNames.length]} ${idx + 1}`,
        crop,
        area,
        idx % 3 === 0 ? 'Активно' : idx % 3 === 1 ? 'Внимание' : 'Завершено',
        dateFromOffset(idx),
        agronomists[idx % agronomists.length],
        Number((5.2 + (idx % 4) * 0.9).toFixed(1)),
        JSON.stringify(createPolygon(idx)),
        `FD-${1000 + idx}`,
        36 + (idx % 8) * 3,
        72 + (idx % 6) * 4,
        JSON.stringify([
          { year: 2024, type: 'Посев', description: 'Стандартные работы', value: crop },
          { year: 2025, type: 'Удобрения', description: 'NPK', value: 'Оптимально' },
          { year: 2026, type: 'Осмотр', description: 'Подготовка сезона', value: 'Стабильно' }
        ]),
        JSON.stringify([
          { year: 2023, yield: 5.8 },
          { year: 2024, yield: 6.4 },
          { year: 2025, yield: 6.9 }
        ])
      ]
    )
    fieldIds.push(rows[0].id)
  }

  for (let idx = 0; idx < fieldIds.length; idx++) {
    for (let sub = 0; sub < 2; sub++) {
      const type = taskTypes[(idx + sub) % taskTypes.length]
      await query(
        `INSERT INTO tasks (legacy_id, field_id, field_name, assignee, type, date, priority, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          `task-${idx * 2 + sub + 1}`,
          fieldIds[idx],
          `${fieldNames[idx % fieldNames.length]} ${idx + 1}`,
          `${names[(idx + sub) % names.length]} Иванов`,
          type,
          dateFromOffset(idx + sub + 1),
          priorities[(idx + sub) % priorities.length],
          taskStatuses[(idx + sub + (idx % 3)) % taskStatuses.length]
        ]
      )
    }
  }

  console.log('Seed completed: admin/admin, 50 fields, 100 tasks')
  await pool.end()
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
