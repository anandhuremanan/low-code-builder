import { Outlet } from "react-router";
import { redirectIfAuthenticated } from "../features/auth/session";

export const clientLoader = Object.assign(
  async () => redirectIfAuthenticated(),
  { hydrate: true as const },
);

export default function AuthLayout() {
  return <Outlet />;
}
