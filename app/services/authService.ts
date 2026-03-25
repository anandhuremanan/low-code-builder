import { encrypt } from "./encryptAndDecryptService";
import { API_BASE_URL } from "../shared/config/env";

export const authService = {
  LoginServiceCall: async function <T = any>(
    endpoint?: string,
    method?: string,
    body: any = {},
    payLoadEncryption: boolean = false,
    fieldsToEncrypt: string[] = [],
  ): Promise<T> {
    let finalBody: any = {};

    if (payLoadEncryption) {
      // 🔐 Encrypt entire payload
      finalBody = { ...body };

      for (const field of fieldsToEncrypt) {
        if (finalBody[field]) {
          finalBody[field] = await encrypt(finalBody[field]);
        }
      }

      const encryptedBody = await encrypt(JSON.stringify(finalBody));

      finalBody = {
        data: encryptedBody,
      };
    } else {
      // 🔐 Encrypt only selected fields
      finalBody = { ...body };

      for (const field of fieldsToEncrypt) {
        if (finalBody[field]) {
          finalBody[field] = await encrypt(finalBody[field]);
        }
      }
      finalBody = { data: finalBody };
    }

    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalBody),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    return res.json();
  },

  SignUpServiceCall: async function <T = any>(
    endpoint?: string,
    method?: string,
    body: any = {},
    payLoadEncryption: boolean = false,
    fieldsToEncrypt: string[] = [],
  ): Promise<T> {
    let finalBody: any = {};

    if (payLoadEncryption) {
      // 🔐 Encrypt entire payload

      finalBody = { ...body, encyptedFields: fieldsToEncrypt };

      for (const field of fieldsToEncrypt) {
        if (finalBody[field]) {
          finalBody[field] = await encrypt(finalBody[field]);
        }
      }

      const encryptedBody = await encrypt(JSON.stringify(finalBody));

      finalBody = {
        data: encryptedBody,
      };
    } else {
      // 🔐 Encrypt only selected fields
      finalBody = { ...body, encyptedFields: fieldsToEncrypt };

      for (const field of fieldsToEncrypt) {
        if (finalBody[field]) {
          finalBody[field] = await encrypt(finalBody[field]);
        }
      }
      finalBody = { data: finalBody };
    }

    const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalBody),
    });
    return res.json();
  },
};
