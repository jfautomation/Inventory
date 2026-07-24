import netImage from "../../assets/images/net.jpg"

type PageContainerProps = {
    children: React.ReactNode;
};

export default function PageContainer({
    children,
}: PageContainerProps) {

    return (
        <div
            className="
        relative
        min-h-screen
        bg-cover
        bg-center
        p-6
      "
            style={{
                backgroundImage: `url(${netImage})`,
            }}
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