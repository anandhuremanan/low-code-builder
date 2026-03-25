import { tokenService } from "./tokenService";
import { API_BASE_URL } from "../shared/config/env";

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) return null;

  const res = await fetch(API_BASE_URL + "/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) return null;

  const data = await res.json();

  tokenService.setTokens(data.accessToken, data.refreshToken);

  return data.accessToken;
}
