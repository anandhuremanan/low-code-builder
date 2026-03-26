import { Outlet } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import Header from "../components/shared/Header";
import { requireAuthenticatedUser } from "../features/auth/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuthenticatedUser(request);
  return null;
}

export default function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
