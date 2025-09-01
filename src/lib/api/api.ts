import axios, { AxiosError, InternalAxiosRequestConfig, AxiosRequestHeaders } from "axios";

// BFF: use same-origin base URL for client-side calls
const baseURL = "";

export const api = axios.create({
  baseURL,
  headers: { Accept: "application/json" },
  withCredentials: false,
});

// In-memory token storage for better security vs. XSS
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  const common: unknown = (api.defaults.headers as unknown as { common?: Record<string, unknown> }).common;
  const authVal = (common && typeof common === 'object' ? (common as Record<string, unknown>).Authorization : undefined) as unknown;
  if (typeof authVal === 'string') {
    const m = authVal.match(/^Bearer\s+(.+)$/i);
    return m ? m[1] : null;
  }
  return null;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    const existing = (config.headers || {}) as AxiosRequestHeaders;
    config.headers = { ...existing, Authorization: `Bearer ${accessToken}` } as AxiosRequestHeaders;
  }
  return config;
});

// --- Refresh token via HttpOnly cookie ---
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await api.post(
      "/api/auth/refresh",
      {},
      { withCredentials: true }
    );
    const token: string | null = data?.data?.token ?? data?.token ?? null;
    setAccessToken(token);
    return token;
  } catch (e) {
    console.error(e);
    setAccessToken(null);
    return null;
  }
}

function processQueue(token: string | null, error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    if (!original) throw error;

    // Never try to refresh when the refresh endpoint itself fails
    if (original.url && /\/api\/auth\/refresh\b/.test(original.url)) {
      throw error;
    }

    // If unauthorized, try refresh once
    if (status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              if (!token) return reject(error);
              original._retry = true;
              const existing = (original.headers || {}) as AxiosRequestHeaders;
              original.headers = { ...existing, Authorization: `Bearer ${token}` } as AxiosRequestHeaders;
              resolve(api(original));
            },
            reject,
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const token = await refreshAccessToken();
        processQueue(token, error);
        if (!token) throw error;
        const existing = (original.headers || {}) as AxiosRequestHeaders;
        original.headers = { ...existing, Authorization: `Bearer ${token}` } as AxiosRequestHeaders;
        return api(original);
      } catch (err) {
        processQueue(null, err);
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);
