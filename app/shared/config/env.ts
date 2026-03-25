const FALLBACK_API_BASE_URL = "http://127.0.0.1:8080";

export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.API_BASE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env.VITE_API_BASE_URL) ||
  FALLBACK_API_BASE_URL;
