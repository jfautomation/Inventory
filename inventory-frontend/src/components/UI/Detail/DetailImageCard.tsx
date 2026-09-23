import { useEffect, useState } from "react";

type DetailImageCardProps = {
  image?: string | null;
  additionalImages?: string[];
  alt?: string;
};

export default function DetailImageCard({
  image,
  additionalImages = [],
  alt = "Part image",
}: DetailImageCardProps) {
  const [selectedImage, setSelectedImage] =
    useState<string | null>(image || null);

  useEffect(() => {
    setSelectedImage(image || null);
  }, [image]);

  const [failedImages, setFailedImages] =
    useState<string[]>([]);

  /*
   * All real images.
   * The primary image stays first.
   */
  const allImages = [
    ...(image ? [image] : []),
    ...additionalImages.filter(Boolean),
  ];

  /*
   * If the currently selected image fails,
   * show the placeholder.
   */
  const isImageAvailable =
    !!selectedImage &&
    !failedImages.includes(selectedImage);

  const handleImageError = (imageUrl: string) => {
    setFailedImages((current) => {
      if (current.includes(imageUrl)) {
        return current;
      }

      return [...current, imageUrl];
    });
  };

  const handleThumbnailClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

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
        flex-col
        items-center
        justify-center
        overflow-hidden
      "
    >

      {/* =====================================================
          MAIN IMAGE
      ===================================================== */}

      <div
        className="
          flex
          flex-1
          min-h-0
          w-full
          items-center
          justify-center
          overflow-hidden
        "
      >
        {isImageAvailable ? (
          <img
            src={selectedImage}
            alt={alt}
            className="
              max-h-full
              max-w-full
              object-contain
            "
            onError={() =>
              handleImageError(selectedImage)
            }
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
              className="h-16 w-16 mb-3"
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


      {/* =====================================================
          THUMBNAILS
      ===================================================== */}

      {allImages.length > 0 && (
        <div
          className="
            mt-3
            flex
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            overflow-x-auto
            pb-1
          "
        >
          {allImages.map((imageUrl, index) => {
            const thumbnailAvailable =
              !failedImages.includes(imageUrl);

            return (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() =>
                  handleThumbnailClick(imageUrl)
                }
                className={`
                  h-14
                  w-14
                  shrink-0
                  overflow-hidden
                  rounded-md
                  border
                  bg-gray-50
                  ${selectedImage === imageUrl
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-gray-200"
                  }
                `}
              >
                {thumbnailAvailable ? (
                  <img
                    src={imageUrl}
                    alt={`${alt} thumbnail ${index + 1}`}
                    className="
                      h-full
                      w-full
                      object-contain
                    "
                    onError={() =>
                      handleImageError(imageUrl)
                    }
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      text-gray-300
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}