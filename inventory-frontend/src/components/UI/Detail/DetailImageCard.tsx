type DetailImageCardProps = {
  image?: string | null;
  alt?: string;
};

export default function DetailImageCard({
  image,
  alt = "Product image",
}: DetailImageCardProps) {
  return (
    <div
      className="
        w-full
        h-[420px]
        border
        border-gray-200
        rounded-xl
        bg-white
        p-4
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >
      <div
        className="
          w-[360px]
          h-[360px]
          rounded-lg
          bg-gray-100
          flex
          items-center
          justify-center
          overflow-hidden
        "
      >
        {image ? (
          <img
            src={image}
            alt={alt}
            className="
              w-full
              h-full
              object-contain
            "
          />
        ) : (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              text-gray-400
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 15l4.5-4.5a2 2 0 012.8 0L14 14l2-2a2 2 0 012.8 0L21 14.2"
              />
              <circle
                cx="15.5"
                cy="9"
                r="1.25"
              />
            </svg>

            <span className="text-sm">
              No Image Available
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

