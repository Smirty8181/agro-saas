import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: new URL('../../.env', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1') })

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://agro:agro_secret@localhost:5432/agro_db'

const useSsl =
  process.env.PGSSL === 'true' ||
  connectionString.includes('sslmode=require') ||
  connectionString.includes('neon.tech')

export const pool = new pg.Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined
})

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params)
}
