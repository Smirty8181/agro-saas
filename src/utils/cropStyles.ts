import type { Crop } from '@/data/mockData'

export interface CropStyle {
  fill: string
  stroke: string
  label: string
}

export const cropStyles: Record<Crop, CropStyle> = {
  Пшеница: { fill: '#F2C94C', stroke: '#B8941F', label: 'Пш' },
  Кукуруза: { fill: '#6FCF97', stroke: '#3A8F5C', label: 'Ку' },
  Подсолнечник: { fill: '#F2994A', stroke: '#C96F1A', label: 'Пс' },
  Соя: { fill: '#B7E4A9', stroke: '#6FAF5A', label: 'Со' }
}

export function resolveCropStyle(crop: string, enabled: boolean): CropStyle {
  if (!enabled) {
    return { fill: '#E8E0D4', stroke: '#8B6F47', label: '—' }
  }
  return cropStyles[crop as Crop] ?? { fill: '#D9D2C5', stroke: '#8B6F47', label: '?' }
}

export function ndviStyle(healthIndex: number): CropStyle {
  if (healthIndex >= 80) return { fill: '#2E7D32', stroke: '#1B5E20', label: 'NDVI' }
  if (healthIndex >= 70) return { fill: '#6FCF97', stroke: '#3A8F5C', label: 'NDVI' }
  if (healthIndex >= 60) return { fill: '#F2C94C', stroke: '#B7791F', label: 'NDVI' }
  return { fill: '#EB5757', stroke: '#C0392B', label: 'NDVI' }
}
