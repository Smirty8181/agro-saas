export function polygonAreaHectares(coordinates: [number, number][]): number {
  if (coordinates.length < 3) return 0

  const R = 6378137
  let area = 0

  for (let i = 0; i < coordinates.length; i++) {
    const j = (i + 1) % coordinates.length
    const lat1 = (coordinates[i][0] * Math.PI) / 180
    const lat2 = (coordinates[j][0] * Math.PI) / 180
    const lng1 = (coordinates[i][1] * Math.PI) / 180
    const lng2 = (coordinates[j][1] * Math.PI) / 180
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }

  area = Math.abs((area * R * R) / 2)
  return Number((area / 10000).toFixed(1))
}

export function polygonCenter(coordinates: [number, number][]): [number, number] {
  const lat = coordinates.reduce((sum, point) => sum + point[0], 0) / coordinates.length
  const lng = coordinates.reduce((sum, point) => sum + point[1], 0) / coordinates.length
  return [lat, lng]
}

export function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6378137
  const lat1 = (a[0] * Math.PI) / 180
  const lat2 = (b[0] * Math.PI) / 180
  const dLat = lat2 - lat1
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** Ray-casting: точка [lat, lng] внутри полигона поля */
export function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  if (polygon.length < 3) return false

  const [lat, lng] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i]
    const [yj, xj] = polygon[j]
    const intersects = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }

  return inside
}

export function requestCurrentPosition(timeoutMs = 12000): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Геолокация недоступна в браузере'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve([position.coords.latitude, position.coords.longitude]),
      (error) => reject(new Error(error.message || 'Не удалось определить GPS')),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 15000 }
    )
  })
}
