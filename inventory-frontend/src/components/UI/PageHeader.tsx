import Breadcrumbs from './Breadcrumbs'

type PageHeaderProps = {
  title: string;
  breadcrumbs?: {
    label: string;
    path?: string;
  }[];
  children?: React.ReactNode;
};

export default function PageHeader({
  title,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <>
      <div
        className="
          flex
          justify-between
          items-center
          p-3
        "
      >
        <div className="flex items-center gap-3">
          {breadcrumbs && (
            <Breadcrumbs items={breadcrumbs} />
          )}


        </div>

        <div className="flex gap-3">
          {children}
        </div>
      </div>

      <hr className="border-gray-200" />
    </>
  );
}