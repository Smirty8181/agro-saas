import { Router } from 'express'
import { query } from '../db/pool.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

const defaultRiskRules = {
  rainWarningMm: 3,
  rainDangerMm: 8,
  soilHumidityLow: 38,
  soilHumidityHigh: 70,
  windMaxMs: 12,
  frostTempC: 0,
  weekRainHigh: 20
}

router.get('/settings', authRequired, async (req, res) => {
  const { rows } = await query<{ settings: object }>(
    'SELECT settings FROM user_settings WHERE user_id = $1',
    [req.user!.id]
  )
  res.json(rows[0]?.settings ?? {})
})

router.put('/settings', authRequired, async (req, res) => {
  const settings = req.body
  await query(
    `INSERT INTO user_settings (user_id, settings) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET settings = EXCLUDED.settings`,
    [req.user!.id, JSON.stringify(settings)]
  )
  res.json(settings)
})

router.get('/risk-rules', authRequired, async (req, res) => {
  const { rows } = await query<{ rules: object }>('SELECT rules FROM risk_rules WHERE user_id = $1', [req.user!.id])
  res.json({ ...defaultRiskRules, ...(rows[0]?.rules ?? {}) })
})

router.put('/risk-rules', authRequired, async (req, res) => {
  const rules = { ...defaultRiskRules, ...req.body }
  await query(
    `INSERT INTO risk_rules (user_id, rules) VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET rules = EXCLUDED.rules`,
    [req.user!.id, JSON.stringify(rules)]
  )
  res.json(rules)
})

router.post('/export-log', authRequired, async (req, res) => {
  const { fileName, format } = req.body as { fileName: string; format: string }
  await query(
    `INSERT INTO export_records (user_id, file_name, format, status) VALUES ($1,$2,$3,'Готово')`,
    [req.user!.id, fileName, format]
  )
  res.json({ ok: true })
})

router.get('/export-records', authRequired, async (_req, res) => {
  const { rows } = await query(
    'SELECT id, file_name AS file, format, status, created_at FROM export_records ORDER BY created_at DESC LIMIT 20'
  )
  res.json(
    rows.map((row) => {
      const r = row as { id: string; file: string; format: string; status: string; created_at: string }
      return { id: r.id, file: r.file, format: r.format, status: r.status, date: new Date(r.created_at).toLocaleString('ru-RU') }
    })
  )
})

router.put('/password', authRequired, async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ ok: false, message: 'Укажите текущий и новый пароль' })
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ ok: false, message: 'Новый пароль должен быть не короче 4 символов' })
  }

  const { rows } = await query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [
    req.user!.id
  ])
  if (!rows[0]) return res.status(404).json({ ok: false, message: 'Пользователь не найден' })

  const bcrypt = await import('bcryptjs')
  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash)
  if (!valid) return res.status(400).json({ ok: false, message: 'Текущий пароль неверный' })

  const hash = await bcrypt.hash(newPassword, 10)
  await query('UPDATE users SET password_hash = $2 WHERE id = $1', [req.user!.id, hash])
  res.json({ ok: true, message: 'Пароль успешно изменён' })
})

export default router
