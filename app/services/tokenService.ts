import { authSession } from "../features/auth/session";

export const tokenService = {
  getAccessToken: () => authSession.getAccessToken(),
  getRefreshToken: () => authSession.getRefreshToken(),
  setTokens: (access: string, refresh: string) => {
    authSession.setSession({ accessToken: access, refreshToken: refresh });
  },
  clear: () => {
    authSession.clear();
  },
};
