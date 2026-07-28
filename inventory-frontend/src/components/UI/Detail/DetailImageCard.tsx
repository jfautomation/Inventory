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
        border
        border-gray-200
        rounded-xl
        p-3
        bg-white
        flex
        items-center
        justify-center
      "
    >
      {image ? (
        <img
          src={image}
          alt={alt}
          className="
            w-full
            h-auto
            object-contain
          "
        />
      ) : (
        <div
          className="
            h-64
            w-full
            flex
            items-center
            justify-center
            text-gray-400
          "
        >
          No Image
        </div>
      )}
    </div>
  );
}