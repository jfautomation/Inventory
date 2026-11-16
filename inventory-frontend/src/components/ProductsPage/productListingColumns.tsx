
import { Link } from "react-router-dom";
import type { Column } from "../UI/DataTable/DataTable.types";
import type { ProductListing, Part, Term } from "../../types";
import ConditionPill from "../UI/ConditionPill";

import { Pencil, Trash2 } from "lucide-react";

const createSlug = (value: string | number | null | undefined): string =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";

export const productListingColumns = (
  parts: Part[],
  brands: Term[],
  categories: Term[],
  conditions: Term[],
  onEdit: (listing: ProductListing) => void,
  onDelete: (listing: ProductListing) => void
): Column<ProductListing>[] => [
  {
    key: "title",
    label: "Product Listing",
    render: (listing) => (
      <Link
        to={`/product-listings/${listing.id}/${createSlug(listing.title)}`}
        onClick={(e) => e.stopPropagation()}
        title={listing.title}
        className="block max-w-[240px] truncate font-semibold text-black hover:text-[#3F76ED] hover:underline"
      >
        {listing.title || "-"}
      </Link>
    ),
  },
  {
    key: "part",
    label: "Part Name / Number",
    render: (listing) => {
      const part = parts.find(
        (item) => Number(item.id) === Number(listing.part_id)
      );

      if (!part) return "-";

      return (
        <div className="text-black">
          <div>{part.name}</div>
          {part.part_number && (
            <div className="text-sm text-gray-500">
              {part.part_number}
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: "category",
    label: "Category",
    render: (listing) => {
      const part = parts.find(
        (item) => Number(item.id) === Number(listing.part_id)
      );

      return (
        categories.find(
          (category) => Number(category.id) === Number(part?.category_id)
        )?.name ?? "-"
      );
    },
  },
  {
    key: "brand",
    label: "Brand",
    render: (listing) => {
      const part = parts.find(
        (item) => Number(item.id) === Number(listing.part_id)
      );

      return (
        brands.find(
          (brand) => Number(brand.id) === Number(part?.brand_id)
        )?.name ?? "-"
      );
    },
  },
  {
    key: "condition",
    label: "Condition",
    render: (listing) => {
      const condition = conditions.find(
        (item) => Number(item.id) === Number(listing.condition_id)
      )?.name;

      return condition ? <ConditionPill condition={condition} /> : "-";
    },
  },
  {
    key: "list_price",
    label: "Price",
    render: (listing) =>
      listing.list_price != null
        ? `$${Number(listing.list_price).toLocaleString()}`
        : "-",
  },
  {
    key: "quantity",
    label: "Quantity",
    render: (listing) => (
      <span className="font-semibold text-gray-900">
        {listing.quantity ?? 0}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (listing) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(listing);
          }}
          title="Edit Listing"
          className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
        >
          <Pencil size={17} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(listing);
          }}
          title="Delete Listing"
          className="rounded-md p-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={17} />
        </button>
      </div>
    ),
  },
];
