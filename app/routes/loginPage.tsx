import type { ClientActionFunctionArgs } from "react-router";
import Auth from "~/account/auth/Auth";
import { handleAuthSubmission } from "../features/auth/client";

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  return handleAuthSubmission(formData);
}

export default function LoginPageRoute() {
  return <Auth />;
}
