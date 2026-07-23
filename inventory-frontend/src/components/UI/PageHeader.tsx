type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};


export default function PageHeader({
  title,
  children,
}: PageHeaderProps) {

  return (
    <div
      className="
        flex
        justify-between
        items-center
        mb-6
      "
    >

      <h1
        className="
          text-2xl
          font-bold
        "
      >
        {title}
      </h1>


      <div className="flex gap-3">
        {children}
      </div>

    </div>
  );
}