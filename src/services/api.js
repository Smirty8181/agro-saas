const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const TOKEN_KEY = 'agro-token';
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
    if (token)
        localStorage.setItem(TOKEN_KEY, token);
    else
        localStorage.removeItem(TOKEN_KEY);
}
export async function apiHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
        return res.ok;
    }
    catch {
        return false;
    }
}
export async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    const token = getToken();
    if (token)
        headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error ?? `Ошибка API (${res.status})`);
    }
    return data;
}
export async function apiLogin(login, password) {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password })
    });
}
export async function apiBootstrap() {
    return apiFetch('/auth/bootstrap');
}
export async function apiPatchField(id, payload) {
    return apiFetch(`/fields/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
}
export async function apiCreateField(payload) {
    return apiFetch('/fields', { method: 'POST', body: JSON.stringify(payload) });
}
export async function apiPatchTask(id, status) {
    return apiFetch(`/tasks/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
}
export async function apiFieldChangelog(fieldId) {
    return apiFetch(`/fields/${encodeURIComponent(fieldId)}/changelog`);
}
export async function apiUpdateSettings(settings) {
    return apiFetch('/user/settings', { method: 'PUT', body: JSON.stringify(settings) });
}
export async function apiUpdateRiskRules(rules) {
    return apiFetch('/user/risk-rules', { method: 'PUT', body: JSON.stringify(rules) });
}
export async function apiChangePassword(currentPassword, newPassword) {
    return apiFetch('/user/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
    });
}
export async function apiLogExport(fileName, format) {
    return apiFetch('/user/export-log', {
        method: 'POST',
        body: JSON.stringify({ fileName, format })
    });
}
export async function apiPreviewImport(file) {
    const form = new FormData();
    form.append('file', file);
    return apiFetch('/import/preview', {
        method: 'POST',
        body: form
    });
}
export async function apiConfirmImport(payload) {
    return apiFetch('/import/confirm', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
//# sourceMappingURL=api.js.map