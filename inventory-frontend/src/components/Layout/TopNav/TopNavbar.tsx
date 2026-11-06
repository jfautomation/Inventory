
import {
  Settings,
  Bell,
  UserRound,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Link } from "react-router-dom";

type BreadcrumbItem = {
  label: string;
  path?: string;
};

type TopNavbarProps = {
  onMenuClick: () => void;
  breadcrumbs?: BreadcrumbItem[];
};

export default function TopNavbar({
  onMenuClick,
  breadcrumbs = [],
}: TopNavbarProps) {
  const items =
    breadcrumbs.length > 0
      ? breadcrumbs
      : [{ label: "Dashboard" }];

  const currentLabel = items[items.length - 1]?.label ?? "Dashboard";

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-30
        flex h-14 items-center justify-between gap-2
        border-b border-gray-200 bg-gray-100
        px-3 sm:px-4 min-[890px]:left-64
      "
    >
      {/* LEFT: MENU AND BREADCRUMBS */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">

        {/* MOBILE / TABLET MENU */}
        <button
          type="button"
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-lg border border-gray-200 bg-white
            text-gray-600 shadow-sm transition
            hover:bg-gray-50 hover:text-gray-900
            min-[890px]:hidden
          "
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* MOBILE / TABLET CURRENT PAGE */}
        <span
          className="
            min-w-0 truncate text-sm font-semibold text-gray-900
            min-[890px]:hidden
          "
        >
          {currentLabel}
        </span>

        {/* DESKTOP BREADCRUMBS */}
        <nav
          aria-label="Breadcrumb"
          className="
            hidden min-w-0 items-center gap-1.5
            overflow-hidden whitespace-nowrap
            min-[890px]:flex
          "
        >
          <Link
            to="/"
            className="shrink-0 text-sm text-gray-500 transition hover:text-gray-900"
          >
            Home
          </Link>

          <ChevronRight
            size={13}
            className="shrink-0 text-gray-400"
          />

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-center gap-1.5"
              >
                {index > 0 && (
                  <ChevronRight
                    size={13}
                    className="shrink-0 text-gray-400"
                  />
                )}

                {item.path && !isLast ? (
                  <Link
                    to={item.path}
                    className="truncate text-sm text-gray-500 hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current="page"
                    className="truncate text-sm font-medium text-gray-900"
                  >
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* RIGHT: USER CONTROLS */}
      <div className="flex h-10 shrink-0 items-center gap-2">

        {/* DESKTOP UTILITIES */}
        <div className="hidden items-center gap-2 min-[890px]:flex">
          <button
            type="button"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg border border-gray-200 bg-white
              text-gray-500 shadow-sm transition
              hover:bg-gray-50 hover:text-gray-900
            "
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={16} />
          </button>

          <button
            type="button"
            className="
              flex h-10 w-10 items-center justify-center
              rounded-lg border border-gray-200 bg-white
              text-gray-500 shadow-sm transition
              hover:bg-gray-50 hover:text-gray-900
            "
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* PROFILE */}
        <button
          type="button"
          className="
            flex h-10 w-10 shrink-0 items-center justify-center
            rounded-lg border border-gray-200 bg-white
            shadow-sm transition hover:bg-gray-50
            min-[890px]:w-auto
            min-[890px]:justify-start
            min-[890px]:gap-2
            min-[890px]:pl-1.5
            min-[890px]:pr-2.5
          "
          aria-label="User profile"
          title="User profile"
        >
          <div
            className="
              flex h-7 w-7 shrink-0 items-center justify-center
              rounded-full bg-blue-100 text-blue-700
            "
          >
            <UserRound size={15} />
          </div>

          <div className="hidden text-left min-[890px]:block">
            <p className="text-xs font-semibold leading-4 text-gray-900">
              Your Full Name
            </p>
            <p className="text-[10px] leading-3 text-gray-500">
              you@example.com
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
