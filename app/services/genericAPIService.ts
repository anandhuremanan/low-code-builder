import { encrypt } from "./encryptAndDecryptService";
import { tokenService } from "./tokenService";
import { refreshAccessToken } from "./refreshTokenService";
import { API_BASE_URL } from "../shared/config/env";

export async function GenericCall<T = any>(
  endpoint: string,
  method: string,
  body: any = {},
  retry = true,
): Promise<T> {
  const accessToken = tokenService.getAccessToken();
  const encryptedBody = await encrypt(body);

  const res = await fetch(API_BASE_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
    body: JSON.stringify({ data: encryptedBody }),
  });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      return GenericCall(endpoint, method, body, false);
    } else {
      tokenService.clear();
      if (typeof window !== "undefined") {
        window.location.assign("/login");
      }
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
