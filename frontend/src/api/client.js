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
 * Confirm presence (guest). Returns updated me response.
 */
export async function confirmPresence() {
  const res = await fetchWithCsrf(`${BASE}/api/me/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to confirm');
  return res.json();
}

/**
 * Decline presence (guest). Returns updated me response.
 */
export async function declinePresence() {
  const res = await fetchWithCsrf(`${BASE}/api/me/decline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to decline');
  return res.json();
}

/**
 * Delete a child (guest). childId: number. Returns 204 on success.
 */
export async function deleteChild(childId) {
  const res = await fetchWithCsrf(`${BASE}/api/me/children/${childId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete child');
}

/**
 * Set email (guest). Optional; pass null or '' to clear. Returns updated me response.
 */
export async function setEmail(email) {
  const res = await fetchWithCsrf(`${BASE}/api/me/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email != null ? String(email).trim() || null : null }),
  });
  if (!res.ok) throw new Error('Failed to set email');
  return res.json();
}

/**
 * Set transfer need (guest). Returns updated me response.
 */
export async function setTransferNeed(need) {
  const res = await fetchWithCsrf(`${BASE}/api/me/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ need: !!need }),
  });
  if (!res.ok) throw new Error('Failed to set transfer need');
  return res.json();
}

/**
 * Add a child (guest). Returns { id, name, age }.
 * age: number 0-13 or null/undefined for not specified.
 */
export async function addChild(name, age) {
  const url = `${BASE}/api/me/children`;
  const payload = { name: name.trim() };
  if (age !== undefined && age !== null && age !== '') {
    const n = Number(age);
    if (!Number.isNaN(n) && n >= 0 && n <= 13) payload.age = n;
  }
  const body = JSON.stringify(payload);
  console.log('[ADD_CHILD] POST', url, payload);
  const res = await fetchWithCsrf(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const status = res.status;
  const ok = res.ok;
  if (!ok) {
    const text = await res.text();
    console.error('[ADD_CHILD] failed:', status, res.statusText, text || '(no body)');
    throw new Error(text || `Failed to add child (${status})`);
  }
  return res.json();
}

/**
 * Submit login (form POST to /login). Spring Security form login creates the session.
 * Success: 200 with body {} (no redirect). Failure: redirect to /login?error.
 */
export async function login(username, password) {
  const url = `${BASE}/login`;
  const token = getCsrfToken();
  const params = new URLSearchParams();
  params.set('username', username.trim());
  params.set('password', password);
  if (token) params.set('_csrf', token);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    credentials: 'include',
  });
  // Success = 200 and JSON body (our custom handler). Failure = redirect to ?error or 302
  const isSuccess = res.ok && !res.redirected;
  const json = res.ok ? await res.json().catch(() => ({})) : {};
  return { res, ok: isSuccess, json };
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
 * List roles (admin only). Returns [{ id, name }, ...] from the roles table.
 */
export async function getRoles() {
  const res = await fetch(`${BASE}/api/admin/roles`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load roles');
  return res.json();
}

/**
 * List all users with children (admin only). Returns [{ username, displayName, partnerName, presenceConfirmed, roles, children }, ...].
 */
export async function getUsers() {
  const res = await fetch(`${BASE}/api/admin/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
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