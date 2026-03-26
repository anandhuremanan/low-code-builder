const readCookie = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
};

export const tokenService = {
  getAccessToken: () => readCookie("accessToken"),
  getRefreshToken: () => readCookie("refreshToken"),
  setTokens: (_access: string, _refresh: string) => undefined,
  clear: () => undefined,
};
