// Small API client for the ClinicBook Django backend.
// - stores the JWT tokens in localStorage
// - sends the access token on protected calls
// - on a 401, refreshes the access token once and retries
// - turns every backend error ({error, code, details}) into an ApiError

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const ACCESS_KEY = "clinicbook_access";
const REFRESH_KEY = "clinicbook_refresh";
const ROLE_KEY = "clinicbook_role";

/* ---------------------------- token storage ---------------------------- */

const canUseStorage = () => typeof window !== "undefined";

export function getAccessToken() {
  return canUseStorage() ? localStorage.getItem(ACCESS_KEY) : null;
}

export function getRefreshToken() {
  return canUseStorage() ? localStorage.getItem(REFRESH_KEY) : null;
}

export function saveTokens({ access, refresh }) {
  if (!canUseStorage()) return;
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function isLoggedIn() {
  return Boolean(getAccessToken() || getRefreshToken());
}

/* --------------------------- role & redirects --------------------------- */

// Where each role lands after logging in. Admin has no frontend page yet:
// the admin signs in at the backend /admin/ site.
const ROLE_HOME = {
  patient: "/dashboard/patient",
  doctor: "/dashboard/doctor",
  // admin: intentionally absent -> uses backend /admin/
};

/** Frontend home page for a role, or undefined if the role has none. */
export function homeFor(role) {
  return ROLE_HOME[role] || null;
}

export function getSavedRole() {
  return canUseStorage() ? localStorage.getItem(ROLE_KEY) : null;
}

export function saveRole(role) {
  if (canUseStorage() && role) localStorage.setItem(ROLE_KEY, role);
}

/* ------------------------------- errors -------------------------------- */

export class ApiError extends Error {
  constructor(message, { code = "error", status = 0, details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = code; // e.g. "invalid_credentials", "validation_error"
    this.status = status; // HTTP status
    this.details = details; // per-field messages for validation errors
  }
}

/** First error message for a form field, or undefined. */
export function fieldError(error, field) {
  const messages = error?.details?.[field];
  if (!messages) return undefined;
  return Array.isArray(messages) ? messages[0] : String(messages);
}

/* ------------------------------ core fetch ----------------------------- */

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null; // empty body (e.g. 205) or not JSON
  }
}

let refreshInFlight = null;

// Several requests may get a 401 at the same time. Refresh tokens rotate
// (each one works once), so they must all share ONE refresh call.
function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refresh = getRefreshToken();
      if (!refresh) throw new ApiError("Please log in again.", { code: "no_refresh", status: 401 });

      const response = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      const data = await readJson(response);

      if (!response.ok) {
        clearTokens();
        throw new ApiError("Your session expired. Please log in again.", {
          code: "session_expired",
          status: 401,
        });
      }
      saveTokens(data); // new access (+ rotated refresh)
      return data.access;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const send = (accessToken) =>
    fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let response;
  try {
    response = await send(auth ? getAccessToken() : null);

    if (response.status === 401 && auth && getRefreshToken()) {
      const newAccess = await refreshAccessToken();
      response = await send(newAccess);
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError("Cannot reach the server. Is the backend running?", {
      code: "network_error",
    });
  }

  const data = await readJson(response);

  if (!response.ok) {
    throw new ApiError(data?.error || "Something went wrong.", {
      code: data?.code,
      status: response.status,
      details: data?.details,
    });
  }
  return data;
}

/* ------------------------------ endpoints ------------------------------ */

/** "New user" form. Creates the account; a verification email is sent. */
export async function registerPatient(form) {
  return request("/auth/register/", { method: "POST", body: form });
}

/** Called by /verify-email with the uid + token from the emailed link. */
export function verifyEmail(uid, token) {
  return request("/auth/verify-email/", { method: "POST", body: { uid, token } });
}

/** Sends a fresh verification email (always succeeds from the UI's view). */
export function resendVerification(email) {
  return request("/auth/resend-verification/", { method: "POST", body: { email } });
}

/** Login page. `identifier` is the email or the phone number. */
export async function login(identifier, password) {
  const data = await request("/auth/login/", {
    method: "POST",
    body: { identifier, password },
  });
  saveTokens(data);
  saveRole(data.user?.role);
  return data.user;
}

/** Blacklists the refresh token on the server, then forgets both tokens. */
export async function logout() {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await request("/auth/logout/", { method: "POST", body: { refresh }, auth: true });
    }
  } catch {
    // Even if the server call fails, the user must end up logged out locally.
  } finally {
    clearTokens();
  }
}

/** Patient dashboard data (patients only). */
export const getPatientDashboard = () => request("/patients/dashboard/", { auth: true });
export const getDoctorDashboard = () => request("/doctors/dashboard/", { auth: true });

/** Edit the signed-in user's own profile. */
export const updateMyProfile = (form) =>
  request("/auth/me/", { method: "PATCH", body: form, auth: true });

/** Doctor: update personal + professional details in one request. */
export const updateDoctorProfile = (form) =>
  request("/doctors/me/", { method: "PATCH", body: form, auth: true });