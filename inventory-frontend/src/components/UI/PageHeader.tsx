type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export default function PageHeader({
  title,
  children,
}: PageHeaderProps) {
  return (
    <>
      <div
        className="
          flex
          justify-between
          items-center
          p-4
        "
      >
        <h1
          className="
            text-3xl
            font-bold
          "
        >
          {title}
        </h1>

        <div className="flex gap-3">
          {children}
        </div>
      </div>

      <hr className="border-gray-200" />
    </>
  );
}