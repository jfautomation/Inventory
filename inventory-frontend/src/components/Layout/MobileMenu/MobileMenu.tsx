
import { NavLink, useNavigate } from "react-router-dom";
import {
  Layers,
  UserRound,
  LogOut,
  X,
} from "lucide-react";

import navigation from "../navigation";
import { useModal } from "../../../context/ModalContext";
import { clearToken } from "../../../api/client";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileMenu({
  isOpen,
  onClose,
}: MobileMenuProps) {
  const { openProduct, openPart } = useModal();
  const navigate = useNavigate();

  if (!isOpen) return null;

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

    onClose();
  };

  const handleLogout = () => {
    clearToken();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 md:hidden"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="flex h-full w-72 max-w-[85vw] flex-col overflow-hidden bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3F76ED] text-white">
              <Layers size={22} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                Inventory app
              </p>
              <p className="text-xs text-gray-500">
                JF Automation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) =>
            item.path ? (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                    flex w-full items-center rounded-lg border
                    px-3 py-3 text-sm transition-colors
                    ${
                      isActive
                        ? "border-[#3F76ED] bg-[#3F76ED] font-semibold text-white"
                        : "border-transparent text-gray-700 hover:bg-gray-100"
                    }
                  `
                }
              >
                {item.name}
              </NavLink>
            ) : (
              <button
                key={item.name}
                type="button"
                onClick={() => handleAction(item.action)}
                className="
                  flex w-full items-center rounded-lg
                  border border-transparent px-3 py-3
                  text-left text-sm text-gray-700
                  transition-colors hover:bg-gray-100
                "
              >
                {item.name}
              </button>
            )
          )}
        </nav>

        {/* ACCOUNT AND LOGOUT */}
        <div className="shrink-0 border-t border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3F76ED] text-white">
              <UserRound size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                My Account
              </p>
              <p className="text-xs text-blue-700">
                Inventory Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3 rounded-lg
              px-3 py-3 text-sm font-medium text-red-600
              transition-colors hover:bg-red-50
            "
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </div>
  );
}
