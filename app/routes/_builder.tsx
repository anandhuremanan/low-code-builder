import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Outlet, useLocation } from "react-router";
import { BuilderProvider } from "../builder/context";
import Header from "../components/shared/Header";
import { requireAuthenticatedUser } from "../features/auth/session";

export const clientLoader = Object.assign(
  async () => requireAuthenticatedUser(),
  { hydrate: true as const },
);

export default function BuilderLayoutRoute() {
  const location = useLocation();
  const shouldShowHeader = location.pathname.startsWith("/configure");

  return (
    <>
      {shouldShowHeader ? <Header /> : null}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BuilderProvider>
          <Outlet />
        </BuilderProvider>
      </LocalizationProvider>
    </>
  );
}
