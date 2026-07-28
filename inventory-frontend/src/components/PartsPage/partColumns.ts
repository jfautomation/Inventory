import type { Column } from "../UI/DataTable/DataTable.types";

export type Part = {
  id: number;
  name: string;
  brand_id: string;
  category_id: string;
  image_id?: number;
  image_url?: string | null;
};


export const partColumns = (
  brands: any[],
  categories: any[]
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
  ];