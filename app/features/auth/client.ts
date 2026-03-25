import { redirect } from "react-router";
import { authSession } from "./session";

type LoginPayload = {
  username: string;
  password: string;
};

type SignupPayload = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNo: string;
  password: string;
};

type AuthActionResult = {
  error?: string;
};

const TEMP_USERNAME = "admin";
const TEMP_PASSWORD = "admin123";

function normalizeResponse(response: any) {
  return {
    accessToken:
      response?.accessToken || response?.token || response?.data?.accessToken,
    refreshToken:
      response?.refreshToken || response?.data?.refreshToken || undefined,
    user: response?.user || response?.data?.user || response,
  };
}

export async function handleAuthSubmission(
  formData: FormData,
): Promise<AuthActionResult> {
  const intent = String(formData.get("intent") || "login");

  try {
    if (intent === "signup") {
      const payload: SignupPayload = {
        firstName: String(formData.get("firstName") || ""),
        lastName: String(formData.get("lastName") || ""),
        username: String(formData.get("username") || ""),
        email: String(formData.get("email") || ""),
        phoneNo: String(formData.get("phoneNo") || ""),
        password: String(formData.get("password") || ""),
      };

      void payload;

      // Temporary until the backend auth API is ready.
      return {
        error: "Signup is temporarily disabled until the backend is ready.",
      };
    }

    const payload: LoginPayload = {
      username: String(formData.get("username") || ""),
      password: String(formData.get("password") || ""),
    };

    // Temporary until the backend auth API is ready.
    // const reponse = await authService.LoginServiceCall(payload);
    if (
      payload.username !== TEMP_USERNAME ||
      payload.password !== TEMP_PASSWORD
    ) {
      return {
        error: `Use username "${TEMP_USERNAME}" and password "${TEMP_PASSWORD}".`,
      };
    }

    authSession.setSession(
      normalizeResponse({
        accessToken: "temporary-access-token",
        refreshToken: "temporary-refresh-token",
        user: {
          username: TEMP_USERNAME,
          role: "admin",
        },
      }),
    );
    throw redirect("/dashboard");
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    return {
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
}
