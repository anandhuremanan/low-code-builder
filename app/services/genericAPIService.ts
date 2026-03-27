import { encrypt } from "./encryptAndDecryptService";
import { API_BASE_URL } from "../shared/config/env";

export async function GenericCall<T>({
  endpoint,
  method,
  body,
  accessToken,
}: {
  endpoint: string;
  method: string;
  body?: unknown;
  accessToken?: string;
}): Promise<T> {
  const normalizedMethod = method.toUpperCase();
  const canSendBody =
    normalizedMethod !== "GET" && normalizedMethod !== "HEAD";

  const headers: Record<string, string> = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let requestBody: string | undefined;

  if (canSendBody) {
    const encryptedBody = await encrypt(body ?? {});
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify({ data: encryptedBody });
  }

  const res = await fetch(API_BASE_URL + endpoint, {
    method: normalizedMethod,
    headers,
    body: requestBody,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
