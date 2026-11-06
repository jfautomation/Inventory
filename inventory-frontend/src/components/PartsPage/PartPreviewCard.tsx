import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";

import type { Part, Term } from "../../types";

type PartPreviewCardProps = {
  part: Part;
  brands: Term[];
  categories: Term[];
  onEdit: (part: Part) => void;
  onDelete: (part: Part) => void;
};

const createSlug = (value: string | number | null | undefined) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "part";

export default function PartPreviewCard({
  part,
  brands,
  categories,
  onEdit,
  onDelete,
}: PartPreviewCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const brand = brands.find(
    (item) => Number(item.id) === Number(part.brand_id)
  );

  const category = categories.find(
    (item) => Number(item.id) === Number(part.category_id)
  );

  const imageAvailable = Boolean(part.image_url) && !imageFailed;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 transition hover:border-gray-300 hover:bg-gray-50">

      {/* Part image */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {imageAvailable ? (
          <img
            src={part.image_url!}
            alt={part.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <ImageIcon size={22} className="text-gray-300" />
        )}
      </div>

      {/* Part information */}
      <div className="min-w-0 flex-1">
        <Link
          to={`/parts/${part.id}/${createSlug(
            part.name || `part-${part.id}`
          )}`}
          onClick={(e) => e.stopPropagation()}
          title={part.name}
          className="block truncate text-sm font-semibold text-gray-900 hover:text-[#3F76ED] hover:underline"
        >
          {part.name || "-"}
        </Link>

        <div className="mt-0.5 truncate text-xs text-gray-500">
          {part.part_number || "No part number"}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {brand?.name && (
            <span className="text-xs text-gray-500">
              {brand.name}
            </span>
          )}

          {category?.name && (
            <span className="text-xs text-gray-400">
              · {category.name}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(part)}
          title="Edit part"
          aria-label={`Edit ${part.name}`}
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(part)}
          title="Delete part"
          aria-label={`Delete ${part.name}`}
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

    </div>
  );
}