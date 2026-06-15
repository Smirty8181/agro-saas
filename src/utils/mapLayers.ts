import L from 'leaflet'

export type BaseLayerId = 'standard' | 'light' | 'none' | 'night'

export function createBaseLayer(id: BaseLayerId): L.TileLayer | null {
  if (id === 'none') return null
  if (id === 'night') {
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd'
    })
  }
  if (id === 'light') {
    return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd'
    })
  }
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  })
}

export function baseLayerLabel(id: BaseLayerId) {
  if (id === 'night') return 'Ночная'
  if (id === 'light') return 'Упрощённая'
  if (id === 'none') return 'Без подложки'
  return 'Стандартная'
}

export function isNightHours(date = new Date()) {
  const hour = date.getHours()
  return hour >= 21 || hour < 6
}
