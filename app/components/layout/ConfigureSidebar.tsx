import { useState } from "react";
import { Link } from "react-router";
import { ChevronDown, type LucideIcon, } from "lucide-react";
import profile from "/assets/images/profile-img.jpg";



export type SidebarSubmenuItem = {
  title: string;
  path: string;
};

export type SidebarMenuItem = {
  title: string;
  icon: LucideIcon;
  path?: string;
  submenu?: SidebarSubmenuItem[];
};

type ConfigureSidebarProps = {
  menuData: SidebarMenuItem[];
  userName?: string;
};

export default function ConfigureSidebar({
  menuData,
  userName = "John Doe",
}: ConfigureSidebarProps) {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const toggleMenu = (index: number) => {
    setOpenMenu((current) => (current === index ? null : index));
  };

  return (
    <div className="sidebar-sec flex h-screen w-64 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-3 border-b border-slate-700 p-3">

        <img src={profile} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
        <div>
          <p className="text-sm font-medium">{userName}</p>
        </div>
      </div>

      <ul className="flex-1 space-y-2 p-3">
        {menuData.map((menu, index) => {
          const Icon = menu.icon;

          return (
            <li key={menu.title}>
              <div
                onClick={() => menu.submenu && toggleMenu(index)}
                className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition hover:bg-slate-800"
              >
                <Icon size={18} />

                {menu.path ? (
                  <Link to={menu.path} className="flex-1">
                    {menu.title}
                  </Link>
                ) : (
                  <span className="flex-1">{menu.title}</span>
                )}

                {menu.submenu ? (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openMenu === index ? "rotate-180" : ""
                      }`}
                  />
                ) : null}
              </div>

              {menu.submenu && openMenu === index ? (
                <ul className="ml-8 mt-1 space-y-1">
                  {menu.submenu.map((subMenu) => (
                    <li key={subMenu.title}>
                      <Link
                        to={subMenu.path}
                        className="block rounded-md p-2 text-sm transition hover:bg-slate-800"
                      >
                        {subMenu.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
