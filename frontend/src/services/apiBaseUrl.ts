const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL in production build");
}

export const API_BASE_URL = apiBaseUrl ?? "http://localhost:4000";