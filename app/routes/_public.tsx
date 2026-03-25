import { Outlet } from "react-router";
import Header from "../components/shared/Header";

export default function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
