import { useState } from "react";
import { Menu } from "lucide-react";
import { Form, NavLink } from "react-router";
import logo from "/assets/images/logo.png";
import { useIsAuthenticated } from "../../features/auth/session";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();

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
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className="hover:text-[#184F79] transition">
                  Dashboard
                </NavLink>
                <Form method="post" action="/logout">
                  <button
                    type="submit"
                    className="hover:text-[#184F79] transition"
                  >
                    <span className="btn-login">Logout</span>
                  </button>
                </Form>
              </>
            ) : (
              <NavLink to="/login" className="hover:text-[#184F79] transition">
                <span className="btn-login">Login</span>
              </NavLink>
            )}
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

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className="block text-gray-600 hover:text-[#184F79]"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <Form
                method="post"
                action="/logout"
                onSubmit={() => setMenuOpen(false)}
              >
                <button
                  type="submit"
                  className="block text-gray-600 hover:text-[#184F79]"
                >
                  Logout
                </button>
              </Form>
            </>
          ) : (
            <NavLink
              to="/login"
              className="block text-gray-600 hover:text-[#184F79]"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>
          )}

          {/* <button className="bg-[#EF4036] text-white w-full py-2 rounded-lg mt-3">
            Get Started
          </button> */}

        </div>
      )}
    </header>
  );
}
