import { useState } from "react";
import { Menu } from "lucide-react";
import { NavLink } from "react-router";
import logo from "../../../public/assets/images/logo.png";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="LowCode Logo"
            className="h-9 w-auto"
          />
        </div>
        <div className="">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
            <NavLink to="/#features" className="hover:text-[#184F79] transition">Features</NavLink>
            <NavLink to="/builder" className="hover:text-[#184F79] transition">Builder</NavLink>
            <NavLink to="/#templates" className="hover:text-[#184F79] transition">Templates</NavLink>
            <NavLink to="/login" className="hover:text-[#184F79] transition"><span className="btn-login">Login</span></NavLink>
          </nav>
        </div>

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

          <NavLink to="/#features" className="block text-gray-600 hover:text-[#184F79]">
            Features
          </NavLink>

          <NavLink to="/builder" className="block text-gray-600 hover:text-[#184F79]">
            Builder
          </NavLink>

          <NavLink to="/#templates" className="block text-gray-600 hover:text-[#184F79]">
            Templates
          </NavLink>

          <NavLink to="/#pricing" className="block text-gray-600 hover:text-[#184F79]">
            Pricing
          </NavLink>

          {/* <button className="bg-[#EF4036] text-white w-full py-2 rounded-lg mt-3">
            Get Started
          </button> */}

        </div>
      )}
    </header>
  );
}
