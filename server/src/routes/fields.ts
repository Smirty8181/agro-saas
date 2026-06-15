import { Router } from 'express'
import { query } from '../db/pool.js'
import { authRequired } from '../middleware/auth.js'
import { logFieldChanges, mapField, resolveFieldDbId } from '../utils/mappers.js'
import type { DbField } from '../utils/mappers.js'

const router = Router()

router.get('/', authRequired, async (_req, res) => {
  const { rows } = await query<DbField>('SELECT * FROM fields ORDER BY number')
  res.json(rows.map(mapField))
})

router.post('/', authRequired, async (req, res) => {
  const body = req.body as Record<string, unknown>
  const { rows: countRows } = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM fields')
  const number = Number(countRows[0].count) + 1
  const legacyId = `field-${Date.now()}`

  const { rows } = await query<DbField>(
    `INSERT INTO fields (
      legacy_id, number, name, crop, area, status, sow_date, agronomist, yield,
      coordinates, field_code, humidity, health_index, history, yield_history
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [
      legacyId,
      number,
      body.name,
      body.crop,
      body.area,
      body.status,
      body.sowDate,
      body.agronomist,
      body.yield,
      JSON.stringify(body.coordinates ?? []),
      `FD-${1000 + number}`,
      body.humidity ?? 45,
      body.healthIndex ?? 78,
      JSON.stringify(body.history ?? []),
      JSON.stringify(body.yieldHistory ?? [])
    ]
  )

  const field = mapField(rows[0])
  await logFieldChanges(query, req, rows[0].id, {}, field, 'create')
  res.status(201).json(field)
})

router.patch('/:id', authRequired, async (req, res) => {
  const fieldDbId = await resolveFieldDbId(req.params.id, query)
  if (!fieldDbId) return res.status(404).json({ error: 'Поле не найдено' })

  const { rows: existingRows } = await query<DbField>('SELECT * FROM fields WHERE id = $1', [fieldDbId])
  const before = mapField(existingRows[0])
  const body = req.body as Record<string, unknown>

  const { rows } = await query<DbField>(
    `UPDATE fields SET
      name = COALESCE($2, name),
      crop = COALESCE($3, crop),
      area = COALESCE($4, area),
      status = COALESCE($5, status),
      sow_date = COALESCE($6, sow_date),
      agronomist = COALESCE($7, agronomist),
      yield = COALESCE($8, yield),
      coordinates = COALESCE($9, coordinates),
      updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [
      fieldDbId,
      body.name ?? null,
      body.crop ?? null,
      body.area ?? null,
      body.status ?? null,
      body.sowDate ?? null,
      body.agronomist ?? null,
      body.yield ?? null,
      body.coordinates ? JSON.stringify(body.coordinates) : null
    ]
  )

  const after = mapField(rows[0])
  await logFieldChanges(query, req, fieldDbId, before, after, 'update')
  res.json(after)
})

router.get('/:id/changelog', authRequired, async (req, res) => {
  const fieldDbId = await resolveFieldDbId(req.params.id, query)
  if (!fieldDbId) return res.status(404).json({ error: 'Поле не найдено' })

  const { rows } = await query(
    `SELECT id, user_name, changed_at, property, old_value, new_value, change_type
     FROM field_changelog WHERE field_id = $1 ORDER BY changed_at DESC LIMIT 100`,
    [fieldDbId]
  )

  res.json(
    rows.map((row) => {
      const r = row as {
        id: string
        user_name: string
        changed_at: string
        property: string
        old_value: string | null
        new_value: string | null
        change_type: string
      }
      return {
        id: r.id,
        userName: r.user_name,
        changedAt: new Date(r.changed_at).toLocaleString('ru-RU'),
        property: r.property,
        oldValue: r.old_value,
        newValue: r.new_value,
        changeType: r.change_type
      }
    })
  )
})

export default router
