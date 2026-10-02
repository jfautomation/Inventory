import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({
  items,
}: BreadcrumbsProps) {
  return (
    <nav
      className="
        flex
        items-center
        gap-2
        text-sm
      "
      aria-label="Breadcrumb"
    >
      {/* HOME ICON */}

      <Link
        to="/"
        className="
          flex
          items-center
          justify-center
          w-7
          h-7
          rounded-full
          bg-[#3F76ED]
          text-white
          hover:opacity-90
          transition
        "
        aria-label="Home"
      >
        <Home size={15} />
      </Link>

      {/* HOME */}

      <ChevronRight
        size={16}
        className="text-gray-400"
      />

      <Link
        to="/"
        className="
          text-gray-500
          hover:text-gray-900
          transition
        "
      >
        Home
      </Link>

      {/* OTHER BREADCRUMBS */}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            <ChevronRight
              size={16}
              className="text-gray-400"
            />

            {item.path ? (
              <Link
                to={item.path}
                className={
                  isLast
                    ? "font-semibold text-[#3F76ED]"
                    : "text-gray-500 hover:text-gray-900 transition"
                }
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "font-semibold text-[#3F76ED]"
                    : "text-gray-500"
                }
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}