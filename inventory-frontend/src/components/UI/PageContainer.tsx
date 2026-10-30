
import type { ReactNode } from "react";
import netImage from "../../assets/images/net.jpg";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function PageContainer({
  children,
  className = "",
  contentClassName = "",
}: PageContainerProps) {
  return (
    <div
      className={`
        min-h-screen
        bg-cover
        bg-center
        p-4
        ${className}
      `}
      style={{
        backgroundImage: `url(${netImage})`,
      }}
    >
      <main
        className={`
          min-h-[calc(100vh-2rem)]
          overflow-hidden
          rounded-xl
          bg-white
          shadow-lg
          ${contentClassName}
        `}
      >
        {children}
      </main>
    </div>
  );
}
