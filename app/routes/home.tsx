import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to <span className="text-blue-600">Low Code Builder</span>
        </h1>
        <p className="text-xl text-gray-600 mt-4">
          Build beautiful pages visually with our intuitive drag-and-drop interface.
        </p>

        <div className="mt-8">
          <Link to="/builder" className="inline-block">
            <Button
              variant="contained"
              color="primary"
              size="large"
              label="Start Building Now"
            />
          </Link>
        </div>

        <div className="mt-12 text-left bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">How to Use the Builder</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              <span className="font-semibold text-gray-900">Drag & Drop:</span> Select components from the sidebar and drag them onto the canvas area.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Customize:</span> Click on any component in the canvas to edit its properties in the side panel.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Structure:</span> Rearrange components and manage hierarchy using the layers view.
            </li>
            <li>
              <span className="font-semibold text-gray-900">Preview:</span> Toggle preview mode to see your page as users will see it.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
