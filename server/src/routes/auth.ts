import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/pool.js'
import { authRequired, signToken } from '../middleware/auth.js'
import { mapField, mapTask } from '../utils/mappers.js'
import type { DbField, DbTask } from '../utils/mappers.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { login, password } = req.body as { login?: string; password?: string }
  if (!login || !password) {
    return res.status(400).json({ error: 'Укажите логин и пароль' })
  }

  const { rows } = await query<{ id: string; login: string; name: string; role: string; password_hash: string }>(
    'SELECT id, login, name, role, password_hash FROM users WHERE login = $1',
    [login.trim()]
  )
  const user = rows[0]
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Неверный логин или пароль' })
  }

  const tokenUser = { id: user.id, login: user.login, name: user.name, role: user.role }
  return res.json({ token: signToken(tokenUser), user: { ...tokenUser, email: '', phone: '', status: 'Активен' } })
})

router.get('/me', authRequired, async (req, res) => {
  const { rows } = await query(
    'SELECT id, login, name, role, email, phone, status FROM users WHERE id = $1',
    [req.user!.id]
  )
  if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' })
  const row = rows[0] as { id: string; login: string; name: string; role: string; email: string; phone: string; status: string }
  res.json({ id: row.id, login: row.login, name: row.name, role: row.role, email: row.email, phone: row.phone, status: row.status })
})

router.get('/bootstrap', authRequired, async (req, res) => {
  const userId = req.user!.id

  const [fieldsRes, tasksRes, settingsRes, riskRes, importRes, exportRes] = await Promise.all([
    query<DbField>('SELECT * FROM fields ORDER BY number'),
    query<DbTask>('SELECT t.*, f.legacy_id AS field_legacy_id FROM tasks t LEFT JOIN fields f ON f.id = t.field_id ORDER BY t.date'),
    query<{ settings: object }>('SELECT settings FROM user_settings WHERE user_id = $1', [userId]),
    query<{ rules: object }>('SELECT rules FROM risk_rules WHERE user_id = $1', [userId]),
    query('SELECT id, file_name AS file, format, status, created_at FROM import_records ORDER BY created_at DESC LIMIT 20'),
    query('SELECT id, file_name AS file, format, status, created_at FROM export_records ORDER BY created_at DESC LIMIT 20')
  ])

  res.json({
    fields: fieldsRes.rows.map(mapField),
    tasks: tasksRes.rows.map(mapTask),
    settings: settingsRes.rows[0]?.settings ?? {},
    riskRules: riskRes.rows[0]?.rules ?? {},
    user: req.user,
    importRecords: importRes.rows.map((row) => {
      const r = row as { id: string; file: string; format: string; status: string; created_at: string }
      return { id: r.id, file: r.file, format: r.format, status: r.status, date: new Date(r.created_at).toLocaleString('ru-RU') }
    }),
    exportRecords: exportRes.rows.map((row) => {
      const r = row as { id: string; file: string; format: string; status: string; created_at: string }
      return { id: r.id, file: r.file, format: r.format, status: r.status, date: new Date(r.created_at).toLocaleString('ru-RU') }
    })
  })
})

export default router
