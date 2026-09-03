import { Link } from "react-router-dom";
import type { Column } from "../UI/DataTable/DataTable.types";
import type { Product, Part } from "../../types";




export const productColumns = (
  parts: Part[],
  categories: { id: number; name: string }[],
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void
): Column<Product>[] => [
    {
      key: "part",
      label: "Part",
      render: (product) => {
        const part = product.part?.[0];

        if (!part) {
          return "-";
        }

        return (
          <Link
            to={`/part/${part.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            {part.name}
          </Link>
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
      render: (product) =>
        product.condition?.[0]?.name ?? "-",
    },

    {
      key: "inventory_status",
      label: "Status",
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
      key: "test_status",
      label: "Test Status",
      render: (product) =>
        product.test_status ? "Passed" : "-",
    },

    {
      key: "actions",
      label: "Actions",
      render: (product) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="text-sm font-medium"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product);
            }}
            className="text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];