import type { Column } from "../UI/DataTable/DataTable.types";
import type { Part } from "../../types";

export const partColumns = (
  brands: any[],
  categories: any[],
  onEdit: (part: Part) => void,
  onDelete: (part: Part) => void
): Column<Part>[] => [
    {
      key: "name",
      label: "Part Name",
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
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(part);
            }}
            className="text-sm font-medium"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(part);
            }}
            className="text-sm font-medium"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

