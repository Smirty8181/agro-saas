/** Парсит число с запятой или точкой (ru-RU ввод). */
export function parseRuDecimal(value: string | number, fallback = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : fallback
}

/** Заменяет запятую на точку при вводе в type="number". */
export function normalizeDecimalFieldInput(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.value.includes(',')) return
  input.value = input.value.replace(',', '.')
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** При нажатии «,» вставляет точку — удобно для ru-RU раскладки. */
export function useCommaAsDot(event: KeyboardEvent) {
  if (event.key !== ',') return
  event.preventDefault()
  const input = event.target as HTMLInputElement
  const start = input.selectionStart ?? input.value.length
  const end = input.selectionEnd ?? start
  input.value = `${input.value.slice(0, start)}.${input.value.slice(end)}`
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

export function formatRuDecimal(value: number, digits = 2) {
  if (!Number.isFinite(value)) return ''
  return value.toFixed(digits).replace(/\.?0+$/, '').replace('.', ',')
}
