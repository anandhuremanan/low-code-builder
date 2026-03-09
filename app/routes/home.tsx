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
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="landing-container">
      {/* header starts */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="LowCode Logo"
              className="h-9 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
            <a href="#" className="hover:text-[#184F79] transition">Features</a>
            <a href="#" className="hover:text-[#184F79] transition">Builder</a>
            <a href="#" className="hover:text-[#184F79] transition">Templates</a>
            <a href="#" className="hover:text-[#184F79] transition"><Menu size={20} /></a>
          </nav>

          {/* CTA Button */}
          {/* <div className="hidden md:block">
            <button className="bg-[#EF4036] text-white px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition">
              Get Started
            </button>
          </div> */}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#184F79]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <Menu size={28} />
          </button>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden px-6 pb-5 space-y-3 border-t bg-white">

            <a href="#" className="block text-gray-600 hover:text-[#184F79]">
              Features
            </a>

            <a href="#" className="block text-gray-600 hover:text-[#184F79]">
              Builder
            </a>

            <a href="#" className="block text-gray-600 hover:text-[#184F79]">
              Templates
            </a>

            <a href="#" className="block text-gray-600 hover:text-[#184F79]">
              Pricing
            </a>

            {/* <button className="bg-[#EF4036] text-white w-full py-2 rounded-lg mt-3">
              Get Started
            </button> */}

          </div>
        )}
      </header>
      {/* header ends */}
      <div className="content-sec w-full md:w-1/2 h-screen md:bg-[url('/public/assets/images/landing-bg.png')] bg-no-repeat bg-right bg-cover">
        <div className="left-sec w-full md:w-1/2">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to
          </h2>
          <h3 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl mt-3">
            <span className="text-blue-600">Low Code Builder</span>
          </h3>
          <p className="text-xl text-gray-600 mt-4 pt-2">
            Build beautiful pages visually with our intuitive drag-and-drop interface.
          </p>

          <div className="mt-10">
            <Link to="/configure" className="inline-block">
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
