import { Settings, Bell, UserRound, ChevronRight } from "lucide-react";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-gray-100 px-4 md:left-64">
      {/* Left side: menu and breadcrumbs */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="shrink-0 text-gray-600 hover:text-gray-900 md:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <span className="text-2xl">☰</span>
        </button>

                <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap"
        >
          {/* Home link */}
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

          {/* Current breadcrumb trail */}
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

      {/* Right side: notifications, settings, profile */}
      <div className="flex h-10 shrink-0 items-center gap-2">
        <button
          type="button"
          className="flex h-full w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        <button
          type="button"
          className="flex h-full w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={16} />
        </button>

        <button
          type="button"
          className="flex h-full items-center gap-2 rounded-lg border border-gray-200 bg-white pl-1.5 pr-2.5 shadow-sm transition hover:bg-gray-50"
          aria-label="User profile"
          title="User profile"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-blue-700">
            <UserRound size={15} />
          </div>

          <div className="text-left">
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