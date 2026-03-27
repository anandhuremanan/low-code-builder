import { GenericCall } from "~/services/genericAPIService";
import type {
  DashboardActionData,
  DashboardLoaderData,
} from "./dashboard.types";

export async function dashboardLoader({ request }: { request: Request }) {
  return GenericCall<DashboardLoaderData>({
    request,
    endpoint: "/api/generic?MappingId=getapplications",
    method: "GET",
  });
}

export async function dashboardAction({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent !== "createApp") {
    return Response.json(
      { error: "Unsupported action." } satisfies DashboardActionData,
      { status: 400 },
    );
  }

  const application_name = String(
    formData.get("application_name") ?? "",
  ).trim();
  const application_description = String(
    formData.get("application_description") ?? "",
  ).trim();

  if (!application_name) {
    return Response.json(
      { error: "App name is required." } satisfies DashboardActionData,
      { status: 400 },
    );
  }

  await GenericCall({
    request,
    endpoint: "/api/generic",
    method: "POST",
    body: {
      application_name,
      application_description,
      mappingId: "createapplication",
    },
  });

  return Response.json({ success: true } satisfies DashboardActionData);
}
