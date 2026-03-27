const FALLBACK_LOGIN_ENDPOINT = "accounts/login";

export const AUTH_LOGIN_ENDPOINT =
  (typeof process !== "undefined" && process.env.AUTH_LOGIN_ENDPOINT) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env.VITE_AUTH_LOGIN_ENDPOINT) ||
  FALLBACK_LOGIN_ENDPOINT;
