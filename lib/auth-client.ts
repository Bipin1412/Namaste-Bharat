const defaultBackendUrl = "http://localhost:4000";

export const AUTH_TOKEN_STORAGE_KEY = "nb_auth_access_token";

export function getBackendBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackendUrl;
}

export function saveAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getAuthToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? "";
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}
