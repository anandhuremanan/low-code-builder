import { Outlet } from "react-router";
import Header from "../components/shared/Header";
import { requireAuthenticatedUser } from "../features/auth/session";

export const clientLoader = Object.assign(
  async () => requireAuthenticatedUser(),
  { hydrate: true as const },
);

export default function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
