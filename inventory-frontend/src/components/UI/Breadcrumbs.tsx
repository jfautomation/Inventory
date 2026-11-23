
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  path?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      className="flex min-w-0 w-full items-center gap-2 text-sm overflow-hidden"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={`${item.label}-${index}`}
            className={`flex min-w-0 items-center gap-2 ${
              isLast ? "flex-1" : "shrink-0"
            }`}
          >
            {index > 0 && (
              <ChevronRight
                size={16}
                className="shrink-0 text-gray-400"
              />
            )}

            {item.path ? (
              <Link
                to={item.path}
                className={`transition hover:text-[#3F76ED] ${
                  isLast
                    ? "min-w-0 truncate font-semibold text-[#3F76ED]"
                    : "shrink-0 whitespace-nowrap text-gray-500"
                }`}
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`${
                  isLast
                    ? "min-w-0 truncate font-semibold text-gray-900"
                    : "shrink-0 text-gray-500"
                }`}
                title={item.label}
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
