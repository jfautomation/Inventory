
import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";

import type { ProductListing, Part, Term } from "../../types";
import ConditionPill from "../UI/ConditionPill";

type ProductListingPreviewCardProps = {
  listing: ProductListing;
  parts: Part[];
  brands: Term[];
  categories: Term[];
  conditions: Term[];
  onEdit: (listing: ProductListing) => void;
  onDelete: (listing: ProductListing) => void;
};

const createSlug = (value: string | number | null | undefined) =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";

export default function ProductListingPreviewCard({
  listing,
  parts,
  brands,
  categories,
  conditions,
  onEdit,
  onDelete,
}: ProductListingPreviewCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const part = parts.find(
    (item) => Number(item.id) === Number(listing.part_id)
  );

  const brand = brands.find(
    (item) => Number(item.id) === Number(part?.brand_id)
  );

  const category = categories.find(
    (item) => Number(item.id) === Number(part?.category_id)
  );

  const condition = conditions.find(
    (item) => Number(item.id) === Number(listing.condition_id)
  );

  const imageAvailable = Boolean(listing.image_url) && !imageFailed;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 transition hover:border-gray-300 hover:bg-gray-50">

      {/* Product image */}
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
        {imageAvailable ? (
          <img
            src={listing.image_url!}
            alt={listing.title}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <ImageIcon size={22} className="text-gray-300" />
        )}
      </div>

      {/* Product information */}
      <div className="min-w-0 flex-1">
        <Link
          to={`/product-listings/${listing.id}/${createSlug(
            listing.title || `product-${listing.id}`
          )}`}
          onClick={(e) => e.stopPropagation()}
          title={listing.title}
          className="block truncate text-sm font-semibold text-gray-900 hover:text-[#3F76ED] hover:underline"
        >
          {listing.title || "-"}
        </Link>

        <div className="mt-0.5 truncate text-xs text-gray-500">
          {part?.part_number || listing.sku || "No part number"}
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

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {condition?.name && (
            <ConditionPill condition={condition.name} />
          )}

          <span className="text-xs font-medium text-gray-700">
            {listing.list_price != null
              ? `$${Number(listing.list_price).toLocaleString()}`
              : "No price"}
          </span>

          <span className="text-xs text-gray-500">
            Qty: {listing.quantity ?? 0}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(listing)}
          title="Edit listing"
          aria-label={`Edit ${listing.title}`}
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={() => onDelete(listing)}
          title="Delete listing"
          aria-label={`Delete ${listing.title}`}
          className="rounded-md p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={15} />
        </button>
      </div>

    </div>
  );
}
