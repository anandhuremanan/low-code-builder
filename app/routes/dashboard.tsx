import type { Route } from "./+types/dashboard";
import { DashboardPage } from "~/features/dashboard/DashboardPage";
import {
  dashboardAction,
  dashboardLoader,
} from "~/features/dashboard/dashboard.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Sample dashboard page" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  return dashboardLoader({ request });
}

export async function action({ request }: Route.ActionArgs) {
  return dashboardAction({ request });
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return <DashboardPage loaderData={loaderData} />;
}
