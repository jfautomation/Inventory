type PageContainerProps = {
    children: React.ReactNode;
};

export default function PageContainer({
    children,
}: PageContainerProps) {

    return (
        <div
            className="
      bg-gray-100
        relative
        min-h-screen
        bg-cover
        bg-center
        p-6
      "
        >

            {/* Tech background goes here later */}

            <div
                className="
          relative
          bg-white
          rounded-xl
          shadow-lg
          p-6
          min-h-screen
        "
            >

                {children}

            </div>

        </div>
    );
}