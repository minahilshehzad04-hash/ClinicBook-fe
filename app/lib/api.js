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
  const logoutRequest = refresh
    ? request("/auth/logout/", { method: "POST", body: { refresh }, auth: true })
    : null;
  clearTokens();

  try {
    if (logoutRequest) await logoutRequest;
  } catch {
    // Even if the server call fails, the user must end up logged out locally.
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

/** Doctor's weekly working windows, grouped by weekday. */
/** Doctor's weekly working windows, grouped by weekday. */
export const getSchedule = () => request("/doctors/schedule/", { auth: true });

export const addScheduleWindow = (form) =>
  request("/doctors/schedule/", { method: "POST", body: form, auth: true });

export const deleteScheduleWindow = (id) =>
  request(`/doctors/schedule/${id}/`, { method: "DELETE", auth: true });

/** Dashboard (for the shell's user) + schedule in one call, so useDashboard can reuse it. */
export async function getDoctorSchedulePage() {
  const [dash, sched] = await Promise.all([getDoctorDashboard(), getSchedule()]);
  return { ...dash, days: sched.days };
}

/** Patient side: doctors who have published availability. */
export const getDoctors = () => request("/doctors/", { auth: true });

/** Patient side: bookable slots for one doctor. */
export const getDoctorSlots = (doctorId, { start, days = 7, duration = 30 } = {}) => {
  const qs = new URLSearchParams({ days: String(days), duration: String(duration) });
  if (start) qs.set("start", start);
  return request(`/doctors/${doctorId}/slots/?${qs}`, { auth: true });
};

/** Dashboard (for the shell's user) + doctor list in one call, for useDashboard. */
export async function getPatientDoctorsPage() {
  const [dash, doctors] = await Promise.all([getPatientDashboard(), getDoctors()]);
  return { ...dash, doctors };
}

/* ----------------------------- appointments ----------------------------- */
// API_URL already ends with /api/v1 and request() already JSON-stringifies the body.

export const bookAppointment = (body) =>
  request("/doctors/schedule/appointments/", { method: "POST", body, auth: true });

export const getMyAppointments = () =>
  request("/doctors/schedule/appointments/", { auth: true });

export const getDoctorInbox = () =>
  request("/doctors/schedule/doctor/appointments/", { auth: true });

export const respondToAppointment = (id, action) =>
  request(`/doctors/schedule/doctor/appointments/${id}/respond/`, {
    method: "PATCH",
    body: { action }, // "accept" | "reject"
    auth: true,
  });

export async function getPatientAppointmentsPage() {
  const [base, appointments] = await Promise.all([
    getPatientDoctorsPage(), // { patient, doctors }
    getMyAppointments(),
  ]);
  return { ...base, appointments };
}

export async function getDoctorAppointmentsPage() {
  const [dash, appointments] = await Promise.all([
    getDoctorDashboard(), // { doctor, ... }
    getDoctorInbox(),
  ]);
  return { ...dash, appointments };
}