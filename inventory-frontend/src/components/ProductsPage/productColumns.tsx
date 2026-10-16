
import { Link } from "react-router-dom";
import type { Column } from "../UI/DataTable/DataTable.types";
import type { Product, Part } from "../../types";
import ConditionPill from "../UI/ConditionPill";

export const productColumns = (
  parts: Part[],
  categories: { id: number; name: string }[],
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void
): Column<Product>[] => [
    {
      key: "title",
      label: "Product Title",
      render: (product) => (
        <Link
          to={`/product/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          title={product.title || ""}
          className="
        block
        max-w-[240px]
        truncate
        font-semibold
        text-black
        hover:text-[#3F76ED]
        hover:underline
      "
        >
          {product.title || "-"}
        </Link>
      ),
    },

    {
      key: "part",
      label: "Part Name / Number",
      render: (product) => {
        const part = product.part?.[0];

        if (!part) {
          return "-";
        }

        return (
          <div className="text-black">
            <div>{part.name}</div>
            {"part_number" in part &&
              typeof part.part_number === "string" &&
              part.part_number && (
                <div className="text-sm">
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
      render: (product) => {
        const partId = product.part?.[0]?.id;

        if (!partId) {
          return "-";
        }

        const fullPart = parts.find(
          (part) => Number(part.id) === Number(partId)
        );

        const category = categories.find(
          (category) =>
            Number(category.id) === Number(fullPart?.category_id)
        );

        return category?.name ?? "-";
      },
    },

    {
      key: "brand",
      label: "Brand",
      render: (product) =>
        product.brand?.[0]?.name ?? "-",
    },

    {
      key: "condition",
      label: "Condition",
      render: (product) => {
        const condition = product.condition?.[0]?.name;

        if (!condition) {
          return "-";
        }

        return <ConditionPill condition={condition} />;
      },
    },

    {
      key: "list_price",
      label: "Price",
      render: (product) =>
        product.list_price
          ? `$${Number(product.list_price).toLocaleString()}`
          : "-",
    },

    {
      key: "actions",
      label: "Actions",
      render: (product) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
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
              onDelete(product);
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
