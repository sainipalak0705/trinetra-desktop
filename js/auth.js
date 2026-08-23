/**
 * TRINETRA — Database Authentication Module
 */

const AUTH_KEY = 'trinetra_session';
const API_BASE = window.location.port === '8000' ? '' : 'http://127.0.0.1:8000';
const GOOGLE_CLIENT_ID = '548435382915-hubfd46jd0h67niu731o8ldt1g55uant.apps.googleusercontent.com';

function _getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── Public API ───────────────────────────────────────────

/**
 * Authenticate with email + password.
 * @returns {Promise<{ ok: boolean, session?: object, error?: string }>}
 */
async function authLogin(email, password) {
  try {
    const response = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (result.ok) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result.session));
      return { ok: true, session: result.session };
    } else {
      return { ok: false, error: result.error || 'Invalid email or password.' };
    }
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, error: 'Connection to database server failed.' };
  }
}

/**
 * Authenticate with Google ID Token.
 * @returns {Promise<{ ok: boolean, session?: object, error?: string }>}
 */
async function authLoginWithGoogle(idToken) {
  try {
    const response = await fetch(`${API_BASE}/api/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
    const result = await response.json();
    if (result.ok) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result.session));
      return { ok: true, session: result.session };
    } else {
      return { ok: false, error: result.error || 'Google login failed.' };
    }
  } catch (err) {
    console.error('Google login error:', err);
    return { ok: false, error: 'Connection to database server failed.' };
  }
}

/**
 * Register a new user.
 * @returns {Promise<{ ok: boolean, session?: object, error?: string }>}
 */
async function authSignup(name, email, password) {
  try {
    const response = await fetch(`${API_BASE}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    const result = await response.json();
    if (result.ok) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(result.session));
      return { ok: true, session: result.session };
    } else {
      return { ok: false, error: result.error || 'Failed to create account.' };
    }
  } catch (err) {
    console.error('Signup error:', err);
    return { ok: false, error: 'Connection to database server failed.' };
  }
}

/**
 * Get current session (null if not logged in or expired).
 */
function authGetSession() {
  const session = _getSession();
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
  return session;
}

/**
 * Log out and clear session.
 */
function authLogout() {
  localStorage.removeItem(AUTH_KEY);
}

/**
 * Guard: redirect to login if not authenticated.
 * Call at top of dashboard pages.
 */
function requireAuth() {
  const session = authGetSession();
  if (!session) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    return null;
  }
  return session;
}

/**
 * Guard: redirect to dashboard if already logged in.
 * Call at top of login/signup pages.
 */
function redirectIfAuthed() {
  const session = authGetSession();
  if (session) {
    window.location.href = 'dashboard.html';
  }
}
