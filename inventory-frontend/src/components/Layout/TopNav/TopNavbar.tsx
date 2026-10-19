import { Settings, Bell, UserRound } from "lucide-react";

type TopNavbarProps = {
  onMenuClick: () => void;
};

export default function TopNavbar({ onMenuClick }: TopNavbarProps) {
  return (
    <header
      className="
        fixed
        top-0
        left-0
        right-0
        z-50
        h-14
        bg-white
        border-b
        flex
        items-center
        justify-between
        px-4
      "
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-gray-600 hover:text-gray-900"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <span className="text-2xl">☰</span>
        </button>

        {/* App title */}
        <h1 className="font-bold text-lg text-gray-900">
          JF Inventory
        </h1>
      </div>

      {/* Right side: notifications, settings, user */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-900 transition"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="text-gray-500 hover:text-gray-900 transition"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <button
          type="button"
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-gray-100
            text-gray-600
            hover:bg-gray-200
            transition
          "
          aria-label="User profile"
          title="User profile"
        >
          <UserRound size={18} />
        </button>
      </div>
    </header>
  );
}
