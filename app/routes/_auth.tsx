import { Outlet } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { redirectIfAuthenticated } from "../features/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return redirectIfAuthenticated(request);
}

export default function AuthLayout() {
  return <Outlet />;
}
