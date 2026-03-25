import CryptoJS from "crypto-js";
const KEY = CryptoJS.enc.Utf8.parse("A9#kLm2@PqR8!xYz$4Vw6Tn&bHjK3sDf");
const IV = CryptoJS.enc.Utf8.parse("Zx9@Lm2#Qp8!RsT1");

// Encrypt Data
export function encrypt(plainText: string): string {
  debugger
  const encrypted = CryptoJS.AES.encrypt(plainText, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Returns Base64 string
}
