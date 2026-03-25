const encoder = new TextEncoder();
const KEY_BYTES = encoder.encode("A9#kLm2@PqR8!xYz$4Vw6Tn&bHjK3sDf");
const IV_BYTES = encoder.encode("Zx9@Lm2#Qp8!RsT1");

let cachedKeyPromise: Promise<CryptoKey> | null = null;

function getCryptoKey(): Promise<CryptoKey> {
  if (!cachedKeyPromise) {
    cachedKeyPromise = crypto.subtle.importKey(
      "raw",
      KEY_BYTES,
      { name: "AES-CBC" },
      false,
      ["encrypt"],
    );
  }

  return cachedKeyPromise;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export async function encrypt(value: unknown): Promise<string> {
  const plainText = typeof value === "string" ? value : JSON.stringify(value);
  const key = await getCryptoKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: IV_BYTES },
    key,
    encoder.encode(plainText),
  );

  return toBase64(encrypted);
}
