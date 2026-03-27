import type { Route } from "./+types/dashboard";
import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router";
import { Plus, X } from "lucide-react";
import { GenericCall } from "~/services/genericAPIService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Sample dashboard page" },
  ];
}

type Applications = {
  application_id: string;
  application_name: string;
  application_description: string;
  created_at: string;
  modified_at: string;
  is_active: boolean;
};

type DashboardLoaderData = {
  data: Applications[];
  success: boolean;
};

type DashboardActionData = {
  success?: boolean;
  error?: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const applications = await GenericCall<DashboardLoaderData>({
    request,
    endpoint: "/api/generic?MappingId=getapplications",
    method: "GET",
  });

  return applications;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent !== "createApp") {
    return Response.json(
      { error: "Unsupported action." } satisfies DashboardActionData,
      { status: 400 },
    );
  }

  const application_name = String(formData.get("application_name") ?? "").trim();
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
    endpoint: "/api/generic?MappingId=createapplication",
    method: "POST",
    body: {
      application_name,
      application_description,
    },
  });

  return Response.json({ success: true } satisfies DashboardActionData);
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const applicationData = loaderData as DashboardLoaderData;

  const { data } = applicationData;
  const fetcher = useFetcher<DashboardActionData>();

  const [open, setOpen] = useState(false);
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const isCreating = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      setAppName("");
      setAppDescription("");
      setOpen(false);
    }
  }, [fetcher.data, fetcher.state]);

  const handleCreateApp = () => {
    const trimmedName = appName.trim();
    const trimmedDescription = appDescription.trim();
    if (!trimmedName) return;

    fetcher.submit(
      {
        intent: "createApp",
        application_name: trimmedName,
        application_description: trimmedDescription,
      },
      { method: "post" },
    );
  };

  return (
    <main className="maindash-sec">
      <section className="mx-auto">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Apps</h2>
            <p className="text-sm text-slate-600">Temporary cards</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((app) => (
            <Link
              key={app.application_id}
              to={`/configure/${app.application_id}`}
              className="app-tile"
            >
              <div className="app-tile-text">
                <h3 className="app-tile-title">{app.application_name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {app.application_description}
                </p>
              </div>
              <div className="app-tile-icons">
                <span className="app-tile-btn">Edit App</span>
              </div>
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-lg font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Plus size={28} />
            </span>
            <span>Create App</span>
          </button>
        </div>
      </section>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Create App
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close create app popup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {fetcher.data?.error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {fetcher.data.error}
                </p>
              ) : null}

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  App Name
                </span>
                <input
                  type="text"
                  value={appName}
                  onChange={(event) => setAppName(event.target.value)}
                  placeholder="Enter app name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </span>
                <textarea
                  value={appDescription}
                  onChange={(event) => setAppDescription(event.target.value)}
                  placeholder="Enter app description"
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isCreating}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateApp}
                disabled={!appName.trim() || isCreating}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
