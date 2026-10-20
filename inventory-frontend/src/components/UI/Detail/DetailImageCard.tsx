import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

type DetailImageCardProps = {
  image?: string | null;
  additionalImages?: string[];
  alt?: string;
};

export default function DetailImageCard({
  image,
  additionalImages = [],
  alt = "Product image",
}: DetailImageCardProps) {
  const allImages = [
    ...new Set(
      [image, ...additionalImages].filter(
        (url): url is string => Boolean(url)
      )
    ),
  ];

  const [selectedImage, setSelectedImage] =
    useState<string | null>(image || allImages[0] || null);

  const [failedImages, setFailedImages] =
    useState<string[]>([]);

  useEffect(() => {
    setSelectedImage(image || allImages[0] || null);
  }, [image, additionalImages]);

  const isImageAvailable =
    !!selectedImage &&
    !failedImages.includes(selectedImage);

  const handleImageError = (imageUrl: string) => {
    setFailedImages((current) =>
      current.includes(imageUrl)
        ? current
        : [...current, imageUrl]
    );
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Main image */}
      <button
        type="button"
        onClick={() => {
          if (isImageAvailable && selectedImage) {
            window.open(
              selectedImage,
              "_blank",
              "noopener,noreferrer"
            );
          }
        }}
        className="
          flex aspect-square w-full max-w-[180px]
          items-center justify-center self-center
          overflow-hidden rounded-lg border border-gray-200
          bg-gray-50
        "
        aria-label="Open full-size image"
      >
        {isImageAvailable ? (
          <img
            src={selectedImage}
            alt={alt}
            className="h-full w-full object-contain p-2"
            onError={() => handleImageError(selectedImage)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImageIcon size={32} strokeWidth={1.5} />
            <span className="text-xs">No image</span>
          </div>
        )}
      </button>

      {/* Thumbnail gallery */}
      {allImages.length > 1 && (
        <div className="flex max-w-full flex-wrap justify-center gap-2">
          {allImages.map((imageUrl, index) => {
            const isSelected = selectedImage === imageUrl;
            const thumbnailAvailable =
              !failedImages.includes(imageUrl);

            return (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => setSelectedImage(imageUrl)}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={isSelected}
                className={`
                  h-11 w-11 shrink-0 overflow-hidden
                  rounded-md border bg-white
                  ${
                    isSelected
                      ? "border-[#3F76ED] ring-2 ring-blue-100"
                      : "border-gray-200 hover:border-gray-400"
                  }
                `}
              >
                {thumbnailAvailable ? (
                  <img
                    src={imageUrl}
                    alt={`${alt} thumbnail ${index + 1}`}
                    className="h-full w-full object-contain p-1"
                    onError={() => handleImageError(imageUrl)}
                  />
                ) : (
                  <ImageIcon
                    size={18}
                    className="mx-auto text-gray-300"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {allImages.length > 1 && (
        <p className="text-center text-xs text-gray-400">
          {allImages.length} images
        </p>
      )}
    </div>
  );
}
