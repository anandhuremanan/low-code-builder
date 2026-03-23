import type { Route } from "./+types/home";
import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Menu } from "lucide-react";
import { useState } from "react";
import logo from "/assets/images/logo.png";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
export default function Home() {
  return (
    <div className="landing-container">
      {/* header starts */}

      {/* header ends */}
      
      <div className="content-sec w-full md:w-1/2 h-screen md:bg-[url('/public/assets/images/landing-bg.png')] bg-no-repeat bg-right bg-cover">
        <div className="left-sec w-full md:w-1/2">
          <h2 className="text-4xl tracking-tight sm:text-5xl md:text-6xl">
            Welcome to
          </h2>
          <h3 className="text-4xl tracking-tight sm:text-5xl md:text-6xl mt-3">
            <span className="text-blue-600">Low Code Builder</span>
          </h3>
          <p className="text-xl text-gray-600 mt-4 pt-2">
            Build beautiful pages visually with our intuitive drag-and-drop interface.
          </p>

          <div className="mt-10">
            <Link to="/login" className="inline-block">
              <Button
                variant="contained"
                color="primary"
                size="large"
                label="Get started"
                className="btn-started"
              />
            </Link>
          </div>
        </div>
        <div className="right-sec">

        </div>
      </div>

      {/* <div className="mt-12 text-left bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
      </div> */}
    </div>
  );
}
