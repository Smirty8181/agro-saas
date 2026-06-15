import { spawn } from 'node:child_process'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import shp from 'shpjs'
import { kml } from '@tmcw/togeojson'
import JSZip from 'jszip'

export interface ImportFieldDraft {
  tempId: string
  name: string
  crop: string
  area: number
  agronomist: string
  status: string
  sowDate: string
  yield: number
  coordinates: [number, number][]
}

function ringToCoords(ring: number[][]): [number, number][] {
  return ring.map(([lng, lat]) => [lat, lng] as [number, number])
}

function featureToDraft(feature: GeoJSON.Feature, index: number): ImportFieldDraft | null {
  const geometry = feature.geometry
  if (!geometry) return null

  let ring: number[][] | null = null
  if (geometry.type === 'Polygon') {
    ring = geometry.coordinates[0]
  } else if (geometry.type === 'MultiPolygon') {
    ring = geometry.coordinates[0]?.[0] ?? null
  }
  if (!ring || ring.length < 3) return null

  const props = (feature.properties ?? {}) as Record<string, unknown>
  return {
    tempId: `draft-${index}-${Date.now()}`,
    name: String(props.name ?? props.title ?? props.label ?? `Импорт ${index + 1}`),
    crop: String(props.crop ?? 'Пшеница'),
    area: Number(props.area ?? 50) || 50,
    agronomist: String(props.agronomist ?? 'Иван Петров'),
    status: String(props.status ?? 'Активно'),
    sowDate: String(props.sowDate ?? props.sow_date ?? '01.04.2026'),
    yield: Number(props.yield ?? 6) || 6,
    coordinates: ringToCoords(ring)
  }
}

export function parseGeoJsonPayload(raw: unknown): ImportFieldDraft[] {
  const drafts: ImportFieldDraft[] = []

  if (Array.isArray(raw)) {
    raw.forEach((item, index) => {
      const row = item as Record<string, unknown>
      if (Array.isArray(row.coordinates) && row.coordinates.length >= 3) {
        drafts.push({
          tempId: `draft-${index}`,
          name: String(row.name ?? `Поле ${index + 1}`),
          crop: String(row.crop ?? 'Пшеница'),
          area: Number(row.area ?? 50) || 50,
          agronomist: String(row.agronomist ?? 'Иван Петров'),
          status: String(row.status ?? 'Активно'),
          sowDate: String(row.sowDate ?? '01.04.2026'),
          yield: Number(row.yield ?? 6) || 6,
          coordinates: row.coordinates as [number, number][]
        })
      }
    })
    return drafts
  }

  if (raw && typeof raw === 'object' && 'features' in raw) {
    const collection = raw as GeoJSON.FeatureCollection
    collection.features.forEach((feature, index) => {
      const draft = featureToDraft(feature, index)
      if (draft) drafts.push(draft)
    })
    return drafts
  }

  if (raw && typeof raw === 'object' && 'fields' in raw) {
    return parseGeoJsonPayload((raw as { fields: unknown }).fields)
  }

  return drafts
}

export async function parseKmlBufferNode(buffer: Buffer): Promise<ImportFieldDraft[]> {
  const { DOMParser } = await import('@xmldom/xmldom')
  const xml = buffer.toString('utf8')
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const geojson = kml(doc as unknown as Document)
  return parseGeoJsonPayload(geojson)
}

export async function parseShapefileBuffer(buffer: Buffer): Promise<ImportFieldDraft[]> {
  try {
    const geo = await shp(buffer)
    return parseGeoJsonPayload(Array.isArray(geo) ? { type: 'FeatureCollection', features: geo.flatMap((g) => ('features' in g ? g.features : [g])) } : geo)
  } catch {
    const zip = await JSZip.loadAsync(buffer)
    const shpFile = Object.keys(zip.files).find((name) => name.toLowerCase().endsWith('.shp'))
    if (!shpFile) throw new Error('Shapefile не найден в архиве')
    const shpBuffer = await zip.file(shpFile)!.async('nodebuffer')
    const geo = await shp(shpBuffer)
    return parseGeoJsonPayload(geo)
  }
}

export async function convertWithOgr2Ogr(buffer: Buffer, ext: string): Promise<ImportFieldDraft[]> {
  const dir = await mkdtemp(join(tmpdir(), 'agro-import-'))
  const inputPath = join(dir, `input.${ext}`)
  const outputPath = join(dir, 'output.geojson')
  await writeFile(inputPath, buffer)

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ogr2ogr', ['-f', 'GeoJSON', outputPath, inputPath], { shell: true })
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ogr2ogr exit ${code}`))))
    proc.on('error', reject)
  })

  const geoRaw = JSON.parse(await readFile(outputPath, 'utf8'))
  await rm(dir, { recursive: true, force: true })
  return parseGeoJsonPayload(geoRaw)
}

export async function parseUploadedFile(
  buffer: Buffer,
  fileName: string
): Promise<{ format: string; drafts: ImportFieldDraft[] }> {
  const lower = fileName.toLowerCase()

  if (lower.endsWith('.json') || lower.endsWith('.geojson')) {
    const raw = JSON.parse(buffer.toString('utf8'))
    return { format: lower.endsWith('.geojson') ? 'GeoJSON' : 'JSON', drafts: parseGeoJsonPayload(raw) }
  }

  if (lower.endsWith('.kml')) {
    return { format: 'KML', drafts: await parseKmlBufferNode(buffer) }
  }

  if (lower.endsWith('.zip') || lower.endsWith('.shp')) {
    try {
      const drafts = await convertWithOgr2Ogr(buffer, lower.endsWith('.zip') ? 'zip' : 'shp')
      return { format: 'Shapefile (ogr2ogr)', drafts }
    } catch {
      const drafts = await parseShapefileBuffer(buffer)
      return { format: 'Shapefile', drafts }
    }
  }

  throw new Error('Неподдерживаемый формат файла')
}
