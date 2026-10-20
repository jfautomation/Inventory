
import { NavLink, useNavigate } from "react-router-dom";
import {
  House,
  List,
  Layers,
  Plus,
  CirclePlus,
  Bell,
  Settings,
  UserRound,
  LogOut,
  ChevronRight,
} from "lucide-react";

import navigation from "../navigation";
import { useModal } from "../../../context/ModalContext";

function getNavIcon(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("home") || normalized.includes("dashboard")) {
    return <House size={18} />;
  }

  if (normalized.includes("product") && normalized.includes("add")) {
    return <Plus size={18} />;
  }

  if (normalized.includes("part") && normalized.includes("add")) {
    return <CirclePlus size={18} />;
  }

  if (normalized.includes("product")) {
    return <List size={18} />;
  }

  if (normalized.includes("part")) {
    return <Layers size={18} />;
  }

  return <List size={18} />;
}

const supportItems = [
  { name: "Notifications", icon: Bell },
  { name: "Settings", icon: Settings },
  { name: "Profile", icon: UserRound },
];

export default function Sidebar() {
  const { openProduct, openPart } = useModal();
  const navigate = useNavigate();

  const handleAction = (action?: string) => {
    switch (action) {
      case "openProduct":
        openProduct();
        break;
      case "openPart":
        openPart();
        break;
      default:
        break;
    }
  };

  const itemClass = (isActive: boolean) =>
    `
      flex w-full items-center gap-3 rounded-lg
      border px-3 py-2.5 text-sm transition-colors
      ${isActive
      ? "border-[#3F76ED] bg-[#3F76ED] font-semibold text-white shadow-sm"
      : "border-transparent text-gray-700 hover:bg-gray-100"
    }
    `;

  const handleLogout = () => {
    // TODO: Clear the authentication token using your auth service.
    navigate("/login");
  };

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-40
        hidden w-64 border-r border-gray-200 bg-white
        md:flex md:flex-col
      "
    >
      {/* SCROLLABLE NAVIGATION */}
      <nav className="min-h-0 flex-1 overflow-y-auto p-4">
        {/* LOGO */}
        <NavLink
          to="/"
          className="mb-6 flex items-center gap-3 rounded-lg py-2"
          aria-label="JF Inventory home"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3F76ED] text-white shadow-sm">
            <Layers size={23} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight text-gray-900">
              Inventory app
            </p>
            <p className="text-xs text-gray-500">
              Inventory Management
            </p>
          </div>
        </NavLink>

        {/* MAIN NAVIGATION */}
        <div className="space-y-1">
          {navigation.map((item) =>
            item.path ? (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => itemClass(isActive)}
              >
                <span className="shrink-0">
                  {getNavIcon(item.name)}
                </span>
                <span>{item.name}</span>
              </NavLink>
            ) : (
              <button
                key={item.name}
                type="button"
                onClick={() => handleAction(item.action)}
                className={itemClass(false)}
              >
                <span className="shrink-0">
                  {getNavIcon(item.name)}
                </span>
                <span>{item.name}</span>
              </button>
            )
          )}
        </div>

        {/* SUPPORT */}
        <div className="mt-6 border-t border-gray-200 pt-5">
          <h2 className="mb-3 px-3 text-xs font-semibold tracking-wider text-gray-400">
            SUPPORT
          </h2>

          <div className="space-y-1">
            {supportItems.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                className={itemClass(false)}
                aria-label={name}
              >
                <Icon size={18} />
                <span>{name}</span>
                <ChevronRight
                  size={15}
                  className="ml-auto text-gray-400"
                />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ACCOUNT PANEL — PINNED TO BOTTOM */}
      <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3F76ED] text-white shadow-sm">
              <UserRound size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                My Account
              </p>
              <p className="text-xs text-blue-700">
                Inventory Management
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="
            flex w-full items-center gap-3 rounded-lg
            border border-transparent px-3 py-2.5
            text-sm font-medium text-red-600
            transition-colors hover:border-red-100
            hover:bg-red-50
          "
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>

        <p className="mt-3 px-3 text-center text-[11px] text-gray-400">
          Inventory tracking app
        </p>
      </div>
    </aside>
  );
}
