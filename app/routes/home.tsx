import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Low Code Builder" },
    { name: "description", content: "Design and configure pages visually with Low Code Builder." },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-white px-4 py-10 text-slate-900 sm:px-6 sm:py-14">
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-10">
        <p className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          Visual Page Builder
        </p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Build polished pages
          <span className="block text-blue-600">faster and visually.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
          Start with layout configuration, then drag components into place and fine tune details in one flow.
        </p>

        <div className="mt-8">
          <Link to="/configure" className="inline-block">
            <Button variant="contained" color="primary" size="large" label="Start Configuring" />
          </Link>
        </div>

        <div className="mt-10 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="font-semibold text-slate-900">Drag and drop</p>
            <p className="mt-1">Add components from the sidebar directly onto the canvas.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="font-semibold text-slate-900">Customize properties</p>
            <p className="mt-1">Edit spacing, styles, and behavior from the right panel.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="font-semibold text-slate-900">Manage structure</p>
            <p className="mt-1">Reorder layers to keep your page hierarchy clean.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="font-semibold text-slate-900">Preview before publish</p>
            <p className="mt-1">Switch to preview mode to verify final output quickly.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
