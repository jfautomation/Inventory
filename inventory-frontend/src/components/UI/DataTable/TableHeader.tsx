import type { ReactNode } from "react";

type TableHeaderProps = {
  icon: ReactNode;
  header: string;
};

export default function TableHeader({
  icon,
  header,
}: TableHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="text-gray-400">
        {icon}
      </span>

      <h2 className="text-lg font-semibold text-gray-900">
        {header}
      </h2>
    </div>
  );
}
