import { Link } from "react-router";
import { useBuilder } from "../builder/context";
import logo from "/assets/images/logo.png";
import headericon from "/assets/images/headericon.png";
import footericon from "/assets/images/footericon.png";
import sidebaricon from "/assets/images/sidebaricon.png";
import pageicon from "/assets/images/pageicon.png";
import { Menu, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LayoutDashboard, FolderKanban, FileText, Globe, Puzzle, Paintbrush, Plug, Wrench, Settings } from "lucide-react";
import { ChevronDown } from "lucide-react";
// import { NavLink } from "react-router-dom";

export const menuData = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/"
  },
  {
    title: "Projects",
    icon: FolderKanban,
    submenu: [
      { title: "All Projects", path: "/projects" },
      { title: "New Project +", path: "/projects/new" }
    ]
  },
  {
    title: "Pages",
    icon: FileText,
    submenu: [
      { title: "All Pages", path: "/pages" },
      { title: "Add Page", path: "/pages/add" }
    ]
  },
  {
    title: "Global",
    icon: Globe,
    submenu: [
      { title: "All Widgets", path: "/widgets" },
      { title: "Add Widget", path: "/widgets/add" },
      { title: "Header", path: "/widgets/header" },
      { title: "Menu", path: "/widgets/menu" },
      { title: "Footer", path: "/widgets/footer" },
      { title: "Side Bar", path: "/widgets/sidebar" }
    ]
  },
  {
    title: "Appearance",
    icon: Paintbrush,
    submenu: [
      { title: "Design", path: "/appearance/design" },
      { title: "Customize", path: "/appearance/customize" }
    ]
  },
  {
    title: "Plugins",
    icon: Plug,
    path: "/plugins"
  },
  {
    title: "Tools",
    icon: Wrench,
    path: "/tools"
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings"
  }
];



export default function ConfigurePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { state, dispatch } = useBuilder();
  const leftEnabled = state.siteSections.sidebarLeft.enabled;
  const rightEnabled = state.siteSections.sidebarRight.enabled;
  const sidebarPlacement =
    leftEnabled && rightEnabled
      ? "both"
      : leftEnabled
        ? "left"
        : rightEnabled
          ? "right"
          : "none";
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (index: any) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const handleSidebarPlacementChange = (value: string) => {
    if (value === "none") {
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarLeft", enabled: false },
      });
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarRight", enabled: false },
      });
      return;
    }
    if (value === "left") {
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarLeft", enabled: true },
      });
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarRight", enabled: false },
      });
      return;
    }
    if (value === "right") {
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarLeft", enabled: false },
      });
      dispatch({
        type: "TOGGLE_SITE_SECTION",
        payload: { section: "sidebarRight", enabled: true },
      });
      return;
    }
    dispatch({
      type: "TOGGLE_SITE_SECTION",
      payload: { section: "sidebarLeft", enabled: true },
    });
    dispatch({
      type: "TOGGLE_SITE_SECTION",
      payload: { section: "sidebarRight", enabled: true },
    });
  };

  const sectionClass =
    "tile-components";
  const summaryClass =
    "components-header cursor-pointer select-none list-none border-b border-slate-100 bg-slate-50/60 px-5 py-4 text-base font-semibold text-slate-900";
  const buttonLinkClass =
    "tile-editbtn";
  const checkboxClass =
    "h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600";

  function handleMenuOpen(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <main className="main-sec">
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
      <section className="body-sec">

        <div className="w-64 h-screen bg-slate-900 text-white flex flex-col sidebar-sec">

          {/* Logo */}
          <div className="p-5 text-sm border-b border-slate-700">
            John Doe
          </div>

          {/* Menu */}
          <ul className="flex-1 p-3 space-y-2">

            {menuData.map((menu, index) => {
              const Icon = menu.icon;

              return (
                <li key={index}>

                  {/* Parent Menu */}
                  <div
                    onClick={() => menu.submenu && toggleMenu(index)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-800 transition"
                  >
                    <Icon size={18} />

                    {menu.path ? (
                      <Link
                        to={menu.path}
                        className="flex-1"
                      >
                        {menu.title}
                      </Link>
                    ) : (
                      <span className="flex-1">{menu.title}</span>
                    )}

                    {menu.submenu && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${openMenu === index ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </div>

                  {/* Sub Menu */}
                  {menu.submenu && openMenu === index && (
                    <ul className="ml-8 mt-1 space-y-1">

                      {menu.submenu.map((sub, i) => (
                        <li key={i}>
                          <Link
                            to={sub.path}
                          // className={({ isActive }:any) =>
                          //   `block p-2 rounded-md text-sm ${
                          //     isActive
                          //       ? "bg-blue-600"
                          //       : "hover:bg-slate-800"
                          //   }`
                          // }
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}

                    </ul>
                  )}

                </li>
              );
            })}

          </ul>
        </div>



        <div className="config-container">
          <div className="heading-sec">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Global Widgets
            </h3>
            {/* <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
            Enable core sections, set sidebar placement, and open each area for
            deeper editing.
          </p> */}
          </div>
          <div className="tile-sec">
            <details open className={sectionClass}>
              <summary className={summaryClass}><div className="me-3">
                <img
                  src={pageicon}
                  alt="LowCode Logo"
                  className="h-8 w-8"
                />
              </div>
                <div className="">Page</div></summary>
              <div className="tile-content"><p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, </p></div>
              <div className="p-5 tile-buttonsec"></div>
              <div className="tile-footerbtn">
                <Link to="/builder" className={buttonLinkClass}>
                  Edit Page <ChevronRight size={21} />
                </Link>
              </div>
            </details>

            <details open className={sectionClass}>
              <summary className={summaryClass}> <div className="me-3">
                <img
                  src={headericon}
                  alt="LowCode Logo"
                  className="h-8 w-8"
                />
              </div>
                <div className="">Header</div> </summary>
              <div className="tile-content"><p>Perspiciatis unde omniaccuss iste natus error accusantium sit voluptatem accusantium laudantium,</p></div>
              <div className="p-5 tile-buttonsec">
                <label className="tile-label">
                  Header Enable
                </label>

                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "TOGGLE_SITE_SECTION",
                      payload: {
                        section: "header",
                        enabled: !state.siteSections.header.enabled,
                      },
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                    ${state.siteSections.header.enabled ? "bg-[#3b7cad]" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                      ${state.siteSections.header.enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>

              </div>
              <div className="tile-footerbtn">
                <Link to="/configure/header" className={buttonLinkClass}>
                  Edit Header <ChevronRight size={21} />
                </Link>
              </div>
            </details>

            <details open className={sectionClass}>
              <summary className={summaryClass}>
                <div className="me-3">
                  <img
                    src={footericon}
                    alt="LowCode Logo"
                    className="h-8 w-8"
                  />
                </div>
                <div className="">Footer</div> </summary>
              <div className="tile-content"><p>Fed ut perspiciatis unde omnis iste voluptatem accusantium doloremque laudantium, </p></div>
              <div className="p-5 tile-buttonsec">
                <label className="tile-label">
                  Footer Enable
                </label>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "TOGGLE_SITE_SECTION",
                      payload: {
                        section: "footer",
                        enabled: !state.siteSections.footer.enabled,
                      },
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${state.siteSections.footer.enabled ? "bg-[#184F79]" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${state.siteSections.footer.enabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <div className="tile-footerbtn">
                <Link to="/configure/footer" className={buttonLinkClass}>
                  Edit Footer <ChevronRight size={21} />
                </Link>
              </div>
            </details>

            <details open className={sectionClass}>
              <summary className={summaryClass}><div className="me-3">
                <img
                  src={sidebaricon}
                  alt="LowCode Logo"
                  className="h-8 w-8"
                />
              </div>
                <div className="">Sidebar</div></summary>
              <div className="tile-content"><p>Edt perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,</p></div>
              <div className="space-y-4 p-5">
                <div className="space-y-1">
                  <label className="text-sm text-slate-700">
                    Sidebar Placement:{" "}
                  </label>
                  <select
                    className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none"
                    value={sidebarPlacement}
                    onChange={(e) => handleSidebarPlacementChange(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {leftEnabled || rightEnabled ? (
                  <div className="grid">
                    {leftEnabled ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Left Sidebar
                        </p>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className={checkboxClass}
                            checked={Boolean(
                              state.siteSections.sidebarLeft.collapsible,
                            )}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_SITE_SECTION",
                                payload: {
                                  section: "sidebarLeft",
                                  updates: { collapsible: e.target.checked },
                                },
                              })
                            }
                          />
                          Collapsible
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className={checkboxClass}
                            checked={Boolean(
                              state.siteSections.sidebarLeft.collapsedByDefault,
                            )}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_SITE_SECTION",
                                payload: {
                                  section: "sidebarLeft",
                                  updates: { collapsedByDefault: e.target.checked },
                                },
                              })
                            }
                          />
                          Collapsed by default
                        </label>
                        <Link
                          to="/configure/sidebar-left"
                          className={buttonLinkClass}
                        >
                          Edit Left Sidebar <ChevronRight size={21} />
                        </Link>
                      </div>
                    ) : null}
                    {rightEnabled ? (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Right Sidebar
                        </p>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className={checkboxClass}
                            checked={Boolean(
                              state.siteSections.sidebarRight.collapsible,
                            )}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_SITE_SECTION",
                                payload: {
                                  section: "sidebarRight",
                                  updates: { collapsible: e.target.checked },
                                },
                              })
                            }
                          />
                          Collapsible
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className={checkboxClass}
                            checked={Boolean(
                              state.siteSections.sidebarRight.collapsedByDefault,
                            )}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_SITE_SECTION",
                                payload: {
                                  section: "sidebarRight",
                                  updates: { collapsedByDefault: e.target.checked },
                                },
                              })
                            }
                          />
                          Collapsed by default
                        </label>
                        <Link
                          to="/configure/sidebar-right"
                          className={buttonLinkClass}
                        >
                          Edit Right Sidebar <ChevronRight size={21} />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Enable a sidebar placement to configure sidebars.
                  </p>
                )}
              </div>
            </details>

          </div>
        </div>
      </section>
    </main >
  );
}
