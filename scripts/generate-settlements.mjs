import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const MIN_POPULATION = Number(process.env.SETTLEMENTS_MIN_POP ?? 1000)

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'place'
}

function parseCsvLine(line, delimiter = ',') {
  const cells = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === delimiter && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }
    current += ch
  }
  cells.push(current)
  return cells
}

function settlementType(typeCode, population) {
  const code = String(typeCode || '').toLowerCase()
  if (code === 'г' || code.includes('гор')) return 'Город'
  if (population >= 50000) return 'Город'
  if (code === 'п' || code === 'пгт' || code.includes('пос')) return 'Посёлок'
  if (code === 'ст' || code.includes('стан')) return 'Село'
  if (code === 'с' || code.includes('сел')) return 'Село'
  if (code === 'д' || code.includes('дер')) return 'Село'
  return 'Село'
}

function zoomForPopulation(population) {
  if (population > 500000) return 9
  if (population > 100000) return 10
  if (population > 50000) return 11
  if (population > 15000) return 12
  if (population > 5000) return 13
  return 14
}

function readRosstatSettlements() {
  const path = join(root, 'scripts/settlements-ru-source.csv')
  if (!existsSync(path)) {
    console.warn('scripts/settlements-ru-source.csv not found — run: npm run settlements:fetch')
    return []
  }

  const text = readFileSync(path, 'utf8')
  const lines = text.split(/\r?\n/).filter(Boolean)
  const header = parseCsvLine(lines[0], ';')
  const idx = Object.fromEntries(header.map((name, index) => [name, index]))
  const items = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i], ';')
    const name = (row[idx.settlement] || '').trim()
    const region = (row[idx.region] || '').trim()
    const municipality = (row[idx.municipality] || '').trim()
    const pop = Number(row[idx.population])
    const lat = Number(row[idx.latitude_dd])
    const lng = Number(row[idx.longitude_dd])
    const typeCode = row[idx.type] || ''

    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (!Number.isFinite(pop) || pop < MIN_POPULATION) continue
    if (lat < 41 || lat > 82 || lng < 19 || lng > 180) continue

    items.push({
      id: `rs-${slug(name)}-${slug(region)}`.slice(0, 72),
      name,
      type: settlementType(typeCode, pop),
      parent:
        settlementType(typeCode, pop) === 'Город'
          ? region
          : municipality
            ? `${region} · ${municipality}`
            : region,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
      zoom: zoomForPopulation(pop),
      population: pop
    })
  }

  return items
}

function readHflabsSettlements() {
  const path = join(root, 'scripts/hflabs-cities.csv')
  try {
    const text = readFileSync(path, 'utf8')
    const lines = text.split(/\r?\n/).filter(Boolean)
    const header = parseCsvLine(lines[0])
    const idx = {
      region: header.indexOf('region'),
      city: header.indexOf('city'),
      settlement: header.indexOf('settlement'),
      lat: header.indexOf('geo_lat'),
      lng: header.indexOf('geo_lon'),
      population: header.indexOf('population'),
      cityType: header.indexOf('city_type'),
      settlementType: header.indexOf('settlement_type')
    }

    const items = []
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i])
      const name = (row[idx.city] || row[idx.settlement] || '').trim()
      const pop = Number(row[idx.population])
      const lat = Number(row[idx.lat])
      const lng = Number(row[idx.lng])
      if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue
      if (!Number.isFinite(pop) || pop < MIN_POPULATION) continue

      const typeLabel = row[idx.city] ? row[idx.cityType] || 'г' : row[idx.settlementType] || 'п'
      items.push({
        id: `h-${slug(name)}-${slug(row[idx.region] || 'ru')}`,
        name,
        type: settlementType(typeLabel, pop),
        parent: row[idx.region] || '',
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        zoom: zoomForPopulation(pop),
        population: pop
      })
    }
    return items
  } catch {
    return []
  }
}

function readArbaevCities() {
  const raw = JSON.parse(readFileSync(join(root, 'scripts/russia-cities-raw.json'), 'utf8'))
  return raw
    .filter((city) => city.population >= MIN_POPULATION && city.coords?.lat && city.coords?.lon)
    .map((city) => ({
      id: `s-${city.label}`,
      name: city.name,
      type: city.type === 'Город' ? 'Город' : 'Село',
      parent: city.region?.fullname ?? city.region?.name ?? '',
      lat: Number(city.coords.lat.toFixed(4)),
      lng: Number(city.coords.lon.toFixed(4)),
      zoom: zoomForPopulation(city.population),
      population: city.population
    }))
}

function normalizeRegionName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/^респ\.?\s*/i, '')
    .replace(/\s*(область|край|республика|автономный округ|ао|округ)\s*$/i, '')
    .trim()
}

function dedupeKey(item) {
  const regionPart = (item.parent || '').split('·')[0].trim()
  return `${item.name.toLowerCase().trim()}|${normalizeRegionName(regionPart)}`
}

function mergeItem(map, item) {
  const key = dedupeKey(item)
  const existing = map.get(key)
  if (!existing || (item.population ?? 0) > (existing.population ?? 0)) {
    map.set(key, item)
  }
}

const merged = new Map()
for (const item of [...readRosstatSettlements(), ...readArbaevCities(), ...readHflabsSettlements()]) {
  mergeItem(merged, item)
}

const settlements = [...merged.values()].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
const outDir = join(root, 'public/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'settlements-ru.json'), JSON.stringify(settlements))
console.log(
  `Generated ${settlements.length} settlements (population ≥ ${MIN_POPULATION}) → public/data/settlements-ru.json`
)
