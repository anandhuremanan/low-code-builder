import { encrypt } from "./encryptAndDecryptService";
let apiUrl = "http://127.0.0.1:8080/";
export const authService = {

LoginServiceCall: async function<T = any>(
  endpoint?: string,
  method?: string,
  body: any = {},
  payLoadEncryption: boolean = false,
  fieldsToEncrypt: string[] = []
): Promise<T> {
  let finalBody: any = {};

  debugger
  if (payLoadEncryption) {
    // 🔐 Encrypt entire payload
finalBody = { ...body };

    fieldsToEncrypt.forEach((field) => {
      if (finalBody[field]) {
        finalBody[field] = encrypt(finalBody[field]);
      }
    });

    const encryptedBody = encrypt(JSON.stringify(finalBody));

    finalBody = {
      data: encryptedBody
    };

  } else {
    // 🔐 Encrypt only selected fields
    finalBody = { ...body };

    fieldsToEncrypt.forEach((field) => {
      if (finalBody[field]) {
        finalBody[field] = encrypt(finalBody[field]);
      }
    });
    finalBody={ data:finalBody };
  }


  const res = await fetch(apiUrl + endpoint, {
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

SignUpServiceCall: async function<T = any>(
  endpoint?: string,
  method?: string,
  body: any = {},
  payLoadEncryption: boolean = false,
  fieldsToEncrypt: string[] = []
): Promise<T> {
let finalBody: any = {};

  if (payLoadEncryption) {
    // 🔐 Encrypt entire payload

finalBody = { ...body, encyptedFields: fieldsToEncrypt };

    fieldsToEncrypt.forEach((field) => {
      if (finalBody[field]) {
        finalBody[field] = encrypt(finalBody[field]);
      }
    });


    const encryptedBody = encrypt(JSON.stringify(finalBody));

    finalBody = {
      data: encryptedBody
    };

  } else {
    // 🔐 Encrypt only selected fields
    finalBody = { ...body, encyptedFields: fieldsToEncrypt };

    fieldsToEncrypt.forEach((field) => {
      if (finalBody[field]) {
        finalBody[field] = encrypt(finalBody[field]);
      }
    });
    finalBody={ data:finalBody };
  }

  const res = await fetch(apiUrl + endpoint, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify( finalBody ),
  }); 
  return res.json();
}
}