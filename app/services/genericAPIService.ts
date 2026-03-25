import { encrypt } from "./encryptAndDecryptService";
import { tokenService } from "./tokenService";
import { refreshAccessToken } from "./refreshTokenService";

let apiUrl = "http://127.0.0.1:8080";

export async function GenericCall<T = any>(
  endpoint: string,
  method: string,
  body: any = {},
  retry = true
): Promise<T> {
debugger
  const accessToken = tokenService.getAccessToken();
  const encryptedBody = encrypt(body);
  console.log("encrypted...",encryptedBody);
  

  const res = await fetch(apiUrl + endpoint, {
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
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}