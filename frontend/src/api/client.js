export const BASE = '/wedding';

/**
 * Get CSRF token from cookie (Spring Security sends XSRF-TOKEN).
 */
export function getCsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Fetch with credentials and CSRF for mutating requests.
 */
export async function fetchWithCsrf(url, options = {}) {
  const token = getCsrfToken();
  const headers = { ...options.headers };
  if (token) {
    headers['X-XSRF-TOKEN'] = token;
  }
  return fetch(url, { ...options, credentials: 'include', headers });
}

export async function getI18n(lang = null) {
  const url = lang ? `${BASE}/api/i18n?lang=${encodeURIComponent(lang)}` : `${BASE}/api/i18n`;
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('i18n failed');
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${BASE}/api/me`, { credentials: 'include' });
  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error('me failed');
  return res.json();
}

/**
 * Submit login form (application/x-www-form-urlencoded with _csrf).
 */
export async function login(username, password) {
  const url = `${BASE}/login`;
  const token = getCsrfToken();
  const body = new URLSearchParams({ username, password });
  if (token) body.set('_csrf', token);
  console.log('[LOGIN] Sending POST', url, { username, hasPassword: !!password, hasCsrf: !!token, bodyLength: body.toString().length });
  const res = await fetchWithCsrf(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  console.log('[LOGIN] Response:', res.status, res.statusText, 'url=', res.url, 'redirected=', res.redirected, 'ok=', res.ok);
  return res;
}

/**
 * Submit logout (POST with CSRF). Backend returns 200 (no redirect) so fetch stays on same origin.
 */
export async function logout() {
  try {
    const token = getCsrfToken();
    const body = token ? new URLSearchParams({ _csrf: token }) : '';
    await fetchWithCsrf(`${BASE}/logout`, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {},
      body: body?.toString() || undefined,
    });
  } finally {
    // Always go to login so user is not stuck if logout request fails (e.g. CORS/network).
    window.location.href = `${BASE}/login`;
  }
}

/**
 * Create a new guest (admin only). Returns { username, displayName, partnerName } on success.
 */
export async function createGuest(body) {
  const res = await fetchWithCsrf(`${BASE}/api/admin/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = new Error(res.status === 409 ? 'Username already exists' : 'Failed to create guest');
    err.status = res.status;
    throw err;
  }
  return res.json();
}