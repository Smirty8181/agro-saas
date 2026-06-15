import { Router } from 'express'
import { query } from '../db/pool.js'
import { authRequired } from '../middleware/auth.js'
import { mapTask, resolveFieldDbId } from '../utils/mappers.js'
import type { DbTask } from '../utils/mappers.js'

const router = Router()

router.get('/', authRequired, async (_req, res) => {
  const { rows } = await query<DbTask>(
    'SELECT t.*, f.legacy_id AS field_legacy_id FROM tasks t LEFT JOIN fields f ON f.id = t.field_id ORDER BY t.date'
  )
  res.json(rows.map(mapTask))
})

router.patch('/:id', authRequired, async (req, res) => {
  const { status } = req.body as { status?: string }
  if (!status) return res.status(400).json({ error: 'Укажите status' })

  const { rows: found } = await query<DbTask>(
    'SELECT * FROM tasks WHERE id::text = $1 OR legacy_id = $1 LIMIT 1',
    [req.params.id]
  )
  if (!found[0]) return res.status(404).json({ error: 'Задача не найдена' })

  await query('UPDATE tasks SET status = $2 WHERE id = $1', [found[0].id, status])

  const { rows } = await query<DbTask>(
    `SELECT t.*, f.legacy_id AS field_legacy_id FROM tasks t
     LEFT JOIN fields f ON f.id = t.field_id WHERE t.id = $1`,
    [found[0].id]
  )
  res.json(mapTask(rows[0]))
})

router.post('/', authRequired, async (req, res) => {
  const body = req.body as Record<string, unknown>
  const fieldDbId = body.fieldId ? await resolveFieldDbId(String(body.fieldId), query) : null

  const { rows } = await query<DbTask>(
    `INSERT INTO tasks (legacy_id, field_id, field_name, assignee, type, date, priority, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      `task-${Date.now()}`,
      fieldDbId,
      body.fieldName,
      body.assignee,
      body.type,
      body.date,
      body.priority ?? 'Средний',
      body.status ?? 'Запланировано'
    ]
  )
  res.status(201).json(mapTask(rows[0]))
})

export default router
