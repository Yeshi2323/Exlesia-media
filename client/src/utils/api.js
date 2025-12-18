// api.js

const API_BASE = "https://exlesiamedia.yeshiharegazeze.com/";

// =========================
// AUTH HELPERS
// =========================

// Get JWT token from localStorage
export function getToken() {
  return localStorage.getItem("admin_token");
}

// Check if admin is logged in
export function isAdmin() {
  return !!getToken();
}

// =========================
// API FETCH WRAPPER
// =========================

export async function apiFetch(path, options = {}) {
  const token = getToken();

  // Clone headers (important to avoid mutating input)
  const headers = { ...(options.headers || {}) };

  // Attach token if exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  /**
   * IMPORTANT:
   * If the request body is FormData → DO NOT set Content-Type
   * Browser will automatically set it correctly
   */
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Make fetch request
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Handle HTTP errors
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { error: res.statusText };
    }
    throw err;
  }

  // Handle endpoints that might return empty response
  try {
    return await res.json();
  } catch {
    return null;
  }
}
