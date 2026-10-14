
import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";

type PageHeaderProps = {
  title?: string;
  sectionTitle?: string;
  breadcrumbs?: {
    label: string;
    path?: string;
  }[];
  children?: ReactNode;
};

export default function PageHeader({
  title,
  sectionTitle,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  const heading = sectionTitle ?? title;

  return (
    <>
      <div className="p-4">
        {/* Top row: breadcrumbs and action buttons */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          </div>

          <div className="flex items-center gap-3">
            {children}
          </div>
        </div>

        {/* Section heading */}
        {heading && (
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">
            {heading}
          </h1>
        )}
      </div>

      <hr className="border-gray-200" />
    </>
  );
}
