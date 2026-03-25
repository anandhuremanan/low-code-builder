import { tokenService } from "./tokenService";

let apiUrl = "http://127.0.0.1:8080";

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenService.getRefreshToken();

  if (!refreshToken) return null;

  const res = await fetch(apiUrl + "/refresh-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) return null;

  const data = await res.json();

  tokenService.setTokens(data.accessToken, data.refreshToken);

  return data.accessToken;
}