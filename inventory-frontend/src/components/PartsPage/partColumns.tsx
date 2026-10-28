import { Link } from "react-router-dom";
import type { Column } from "../UI/DataTable/DataTable.types";
import type { Part } from "../../types";

const createSlug = (value: string | number | null | undefined): string =>
  String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "part";

export const partColumns = (
  brands: any[],
  categories: any[],
  onEdit: (part: Part) => void,
  onDelete: (part: Part) => void
): Column<Part>[] => [
  {
    key: "name",
    label: "Part Name",
    render: (part) => (
      <Link
        to={`/parts/${part.id}/${createSlug(
          part.name || `part-${part.id}`
        )}`}
        onClick={(e) => e.stopPropagation()}
        className="font-medium hover:text-blue-500 hover:underline"
      >
        {part.name}
      </Link>
    ),
  },

  {
    key: "brand_id",
    label: "Brand",
    render: (part) => {
      const brand = brands.find(
        (b) => b.id === Number(part.brand_id)
      );

      return brand?.name || "-";
    },
  },

  {
    key: "category_id",
    label: "Category",
    render: (part) => {
      const category = categories.find(
        (c) => c.id === Number(part.category_id)
      );

      return category?.name || "-";
    },
  },

  {
    key: "actions",
    label: "Actions",
    render: (part) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(part);
          }}
          className="
            rounded-md
            border border-gray-300
            bg-gray-100
            px-3 py-1
            text-sm font-medium
            text-gray-700
            transition
            hover:bg-gray-200
            hover:text-gray-900
          "
        >
          Edit
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(part);
          }}
          className="
            rounded-md
            border border-gray-300
            bg-gray-100
            px-3 py-1
            text-sm font-medium
            text-gray-700
            transition
            hover:border-red-200
            hover:bg-red-50
            hover:text-red-600
          "
        >
          Delete
        </button>
      </div>
    ),
  },
];