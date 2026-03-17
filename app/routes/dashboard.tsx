import type { Route } from "./+types/dashboard";
import { Link } from "react-router";
import { Plus } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Sample dashboard page" },
  ];
}

const apps = [
  {
    id: "app-1",
    name: "App 1",
    description: "Temporary sample app. Later this can come from API data.",
  },
  {
    id: "app-2",
    name: "App 2",
    description: "Another sample app card with a short description.",
  },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Apps</h2>
            <p className="text-sm text-slate-600">Temporary cards</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Link
              key={app.id}
              to={`/configure/${app.id}`}
              className="block rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 font-semibold text-blue-600">
                {app.name}
              </div>
              <h3 className="text-lg font-semibold">{app.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {app.description}
              </p>
            </Link>
          ))}

          <Link
            to="/configure"
            className="flex min-h-56 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-lg font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Plus size={28} />
            </span>
            <span>Create App</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
