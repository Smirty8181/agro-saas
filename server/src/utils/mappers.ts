import type { Request } from 'express'

export interface DbField {
  id: string
  legacy_id: string | null
  number: number
  name: string
  crop: string
  area: string
  status: string
  sow_date: string | null
  agronomist: string | null
  yield: string
  coordinates: [number, number][]
  field_code: string | null
  humidity: number
  health_index: number
  history: unknown[]
  yield_history: unknown[]
}

export interface DbTask {
  id: string
  legacy_id: string | null
  field_id: string | null
  field_legacy_id?: string | null
  field_name: string
  assignee: string
  type: string
  date: string
  priority: string
  status: string
}

export function mapField(row: DbField) {
  return {
    id: row.legacy_id ?? row.id,
    dbId: row.id,
    number: row.number,
    name: row.name,
    crop: row.crop,
    area: Number(row.area),
    status: row.status,
    sowDate: row.sow_date ?? '',
    agronomist: row.agronomist ?? '',
    yield: Number(row.yield),
    coordinates: row.coordinates ?? [],
    fieldCode: row.field_code ?? '',
    humidity: row.humidity,
    healthIndex: row.health_index,
    history: row.history ?? [],
    yieldHistory: row.yield_history ?? []
  }
}

export function mapTask(row: DbTask) {
  return {
    id: row.legacy_id ?? row.id,
    dbId: row.id,
    fieldId: row.field_legacy_id ?? row.field_id ?? '',
    fieldName: row.field_name,
    assignee: row.assignee,
    type: row.type,
    date: row.date,
    priority: row.priority,
    status: row.status
  }
}

export async function resolveFieldDbId(fieldKey: string, queryFn: typeof import('../db/pool.js').query) {
  const { rows } = await queryFn<{ id: string }>(
    'SELECT id FROM fields WHERE id::text = $1 OR legacy_id = $1 LIMIT 1',
    [fieldKey]
  )
  return rows[0]?.id ?? null
}

export async function logFieldChanges(
  queryFn: typeof import('../db/pool.js').query,
  req: Request,
  fieldDbId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  changeType = 'update'
) {
  const user = req.user
  const tracked = ['name', 'crop', 'area', 'status', 'sowDate', 'agronomist', 'yield', 'coordinates'] as const
  for (const key of tracked) {
    const oldVal = before[key]
    const newVal = after[key]
    const oldStr = key === 'coordinates' ? JSON.stringify(oldVal) : String(oldVal ?? '')
    const newStr = key === 'coordinates' ? JSON.stringify(newVal) : String(newVal ?? '')
    if (oldStr !== newStr) {
      await queryFn(
        `INSERT INTO field_changelog (field_id, user_id, user_name, property, old_value, new_value, change_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [fieldDbId, user?.id ?? null, user?.name ?? 'Система', key, oldStr, newStr, changeType]
      )
    }
  }
}
