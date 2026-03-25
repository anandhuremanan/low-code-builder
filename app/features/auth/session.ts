import { useSyncExternalStore } from "react";
import { redirect } from "react-router";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const SESSION_FLAG_KEY = "auth:session-active";
const USER_KEY = "auth:user";
const SESSION_EVENT = "auth-session-change";

const canUseStorage = () => typeof window !== "undefined";

const getStorage = () => {
  if (!canUseStorage()) return null;
  return window.localStorage;
};

const notifySessionChange = () => {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(SESSION_EVENT));
};

const subscribeToSession = (callback: () => void) => {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (
      !event.key ||
      [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, SESSION_FLAG_KEY, USER_KEY].includes(
        event.key,
      )
    ) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SESSION_EVENT, callback);
  };
};

const getAuthSnapshot = () => authSession.isAuthenticated();

export const authSession = {
  getAccessToken() {
    return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  },
  getRefreshToken() {
    return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
  },
  isAuthenticated() {
    const storage = getStorage();
    if (!storage) return false;
    return Boolean(
      storage.getItem(ACCESS_TOKEN_KEY) || storage.getItem(SESSION_FLAG_KEY),
    );
  },
  setSession(payload: { accessToken?: string; refreshToken?: string; user?: unknown }) {
    const storage = getStorage();
    if (!storage) return;

    if (payload.accessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
    }

    if (payload.refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
    }

    storage.setItem(SESSION_FLAG_KEY, "true");

    if (payload.user !== undefined) {
      storage.setItem(USER_KEY, JSON.stringify(payload.user));
    }

    notifySessionChange();
  },
  clear() {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(SESSION_FLAG_KEY);
    storage.removeItem(USER_KEY);
    notifySessionChange();
  },
};

export function useIsAuthenticated() {
  return useSyncExternalStore(subscribeToSession, getAuthSnapshot, () => false);
}

export async function requireAuthenticatedUser() {
  if (!authSession.isAuthenticated()) {
    throw redirect("/login");
  }
  return null;
}

export async function redirectIfAuthenticated() {
  if (authSession.isAuthenticated()) {
    throw redirect("/dashboard");
  }
  return null;
}
