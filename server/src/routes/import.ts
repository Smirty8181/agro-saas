import { Router } from 'express'
import multer from 'multer'
import { query } from '../db/pool.js'
import { authRequired } from '../middleware/auth.js'
import { logFieldChanges, mapField } from '../utils/mappers.js'
import type { DbField } from '../utils/mappers.js'
import { parseGeoJsonPayload, parseUploadedFile, type ImportFieldDraft } from '../services/importParser.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 30 * 1024 * 1024 } })
const router = Router()

router.post('/preview', authRequired, upload.single('file'), async (req, res) => {
  try {
    if (req.file) {
      const parsed = await parseUploadedFile(req.file.buffer, req.file.originalname)
      return res.json({ fileName: req.file.originalname, format: parsed.format, drafts: parsed.drafts })
    }

    const drafts = parseGeoJsonPayload(req.body)
    return res.json({ fileName: 'payload.json', format: 'JSON', drafts })
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Ошибка разбора файла' })
  }
})

router.post('/confirm', authRequired, async (req, res) => {
  const { fileName, format, drafts } = req.body as {
    fileName: string
    format: string
    drafts: ImportFieldDraft[]
  }

  if (!drafts?.length) {
    return res.status(400).json({ error: 'Нет полей для импорта' })
  }

  const created = []
  for (const draft of drafts) {
    const { rows: countRows } = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM fields')
    const number = Number(countRows[0].count) + 1
    const legacyId = `field-${Date.now()}-${number}`

    const { rows } = await query<DbField>(
      `INSERT INTO fields (
        legacy_id, number, name, crop, area, status, sow_date, agronomist, yield,
        coordinates, field_code, humidity, health_index, history, yield_history
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        legacyId,
        number,
        draft.name,
        draft.crop,
        draft.area,
        draft.status,
        draft.sowDate,
        draft.agronomist,
        draft.yield,
        JSON.stringify(draft.coordinates),
        `FD-${1000 + number}`,
        45,
        78,
        JSON.stringify([{ year: 2026, type: 'Импорт', description: `Файл ${fileName}`, value: format }]),
        JSON.stringify([{ year: 2025, yield: draft.yield }])
      ]
    )
    const field = mapField(rows[0])
    await logFieldChanges(query, req, rows[0].id, {}, field, 'import')
    created.push(field)
  }

  await query(
    `INSERT INTO import_records (user_id, file_name, format, status, imported_count)
     VALUES ($1,$2,$3,$4,$5)`,
    [req.user!.id, fileName, format, `Импортировано ${created.length} полей`, created.length]
  )

  res.json({ imported: created.length, fields: created })
})

router.get('/records', authRequired, async (_req, res) => {
  const { rows } = await query(
    'SELECT id, file_name AS file, format, status, created_at FROM import_records ORDER BY created_at DESC LIMIT 20'
  )
  res.json(
    rows.map((row) => {
      const r = row as { id: string; file: string; format: string; status: string; created_at: string }
      return { id: r.id, file: r.file, format: r.format, status: r.status, date: new Date(r.created_at).toLocaleString('ru-RU') }
    })
  )
})

export default router
