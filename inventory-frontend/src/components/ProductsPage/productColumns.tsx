import type { Column } from "../UI/DataTable/DataTable.types";
import type { Product } from "../../types";

export const productColumns = (
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void
): Column<Product>[] => [
  {
    key: "part",
    label: "Part",
    render: (product) =>
      product.part?.[0]?.name ?? "-",
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
    key: "quantity",
    label: "Qty",
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