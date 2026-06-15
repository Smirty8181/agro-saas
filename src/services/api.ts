const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'agro-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function apiHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Ошибка API (${res.status})`)
  }
  return data as T
}

export async function apiLogin(login: string, password: string) {
  return apiFetch<{ token: string; user: Record<string, unknown> }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login, password })
  })
}

export async function apiBootstrap() {
  return apiFetch<{
    fields: unknown[]
    tasks: unknown[]
    settings: Record<string, unknown>
    riskRules: Record<string, unknown>
    importRecords: unknown[]
    exportRecords: unknown[]
    user?: Record<string, unknown>
  }>('/auth/bootstrap')
}

export async function apiPatchField(id: string, payload: Record<string, unknown>) {
  return apiFetch<unknown>(`/fields/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
}

export async function apiCreateField(payload: Record<string, unknown>) {
  return apiFetch<unknown>('/fields', { method: 'POST', body: JSON.stringify(payload) })
}

export async function apiPatchTask(id: string, status: string) {
  return apiFetch<unknown>(`/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

export async function apiFieldChangelog(fieldId: string) {
  return apiFetch<unknown[]>(`/fields/${encodeURIComponent(fieldId)}/changelog`)
}

export async function apiUpdateSettings(settings: Record<string, unknown>) {
  return apiFetch('/user/settings', { method: 'PUT', body: JSON.stringify(settings) })
}

export async function apiUpdateRiskRules(rules: Record<string, unknown>) {
  return apiFetch('/user/risk-rules', { method: 'PUT', body: JSON.stringify(rules) })
}

export async function apiChangePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ ok: boolean; message: string }>('/user/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  })
}

export async function apiLogExport(fileName: string, format: string) {
  return apiFetch('/user/export-log', {
    method: 'POST',
    body: JSON.stringify({ fileName, format })
  })
}

export interface ImportDraft {
  tempId: string
  name: string
  crop: string
  area: number
  agronomist: string
  status: string
  sowDate: string
  yield: number
  coordinates: [number, number][]
  selected?: boolean
}

export async function apiPreviewImport(file: File) {
  const form = new FormData()
  form.append('file', file)
  return apiFetch<{ fileName: string; format: string; drafts: ImportDraft[] }>('/import/preview', {
    method: 'POST',
    body: form
  })
}

export async function apiConfirmImport(payload: { fileName: string; format: string; drafts: ImportDraft[] }) {
  return apiFetch<{ imported: number; fields: unknown[]; record?: unknown }>('/import/confirm', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
