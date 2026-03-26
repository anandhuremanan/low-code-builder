import type { ActionFunctionArgs } from "react-router";
import Auth from "~/account/auth/Auth";
import { handleAuthSubmission } from "../features/auth/client";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return handleAuthSubmission(request, formData);
}

export default function LoginPageRoute() {
  return <Auth />;
}
