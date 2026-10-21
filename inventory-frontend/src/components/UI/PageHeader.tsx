import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  sectionTitle?: string;
  children?: ReactNode;
};

export default function PageHeader({
  title,
  sectionTitle,
  children,
}: PageHeaderProps) {
  const heading = sectionTitle ?? title;

  return (
    <>
      <div className="py-2 px-4">
        <div className="flex items-center justify-between gap-4">
          {heading && (
            <h1 className="text-2xl font-semibold text-gray-900">
              {heading}
            </h1>
          )}

          <div className="flex items-center gap-3">
            {children}
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />
    </>
  );
}