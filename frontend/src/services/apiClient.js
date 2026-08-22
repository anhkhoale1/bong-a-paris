import { clearAuthToken, getAuthToken } from "./authToken.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(message, errors = [], status = 500) {
    super(message);
    this.name = "ApiError";
    this.errors = errors;
    this.status = status;
  }
}

export async function apiClient(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    if (response.status === 401 && path !== "/auth/login") {
      clearAuthToken();
      const redirect = `${window.location.pathname}${window.location.search}`;
      window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
    throw new ApiError(
      body?.message || "Không thể kết nối đến máy chủ.",
      body?.errors || [],
      response.status,
    );
  }
  return body?.data;
}

export function queryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "")
      searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
