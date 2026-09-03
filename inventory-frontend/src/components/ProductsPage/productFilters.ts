import type { Product, Part } from "../../types";

type ProductFilterValues = {
  search: string;
  category: string;
  brand: string;
  shelf: string;
  condition: string;
};

export const filterProducts = (
  products: Product[],
  parts: Part[],
  filters: ProductFilterValues
): Product[] => {
  const searchTerm = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    const partName =
      product.part?.[0]?.name?.toLowerCase() || "";

    const productTitle =
      product.title?.toLowerCase() || "";

    const serialNumber =
      product.serial_number?.toLowerCase() || "";

    const workOrder =
      product.work_order?.toLowerCase() || "";

    const brandName =
      product.brand?.[0]?.name?.toLowerCase() || "";

    const conditionName =
      product.condition?.[0]?.name?.toLowerCase() || "";

    const matchesSearch =
      !searchTerm ||
      partName.includes(searchTerm) ||
      productTitle.includes(searchTerm) ||
      serialNumber.includes(searchTerm) ||
      workOrder.includes(searchTerm) ||
      brandName.includes(searchTerm) ||
      conditionName.includes(searchTerm);

    const productBrandId =
      product.brand?.[0]?.id;

    const matchesBrand =
      !filters.brand ||
      Number(productBrandId) === Number(filters.brand);

    const partId =
      product.part?.[0]?.id;

    const fullPart = parts.find(
      (part) => Number(part.id) === Number(partId)
    );

    const matchesCategory =
      !filters.category ||
      Number(fullPart?.category_id) === Number(filters.category);

    const productShelfId =
      product.shelf?.[0]?.id;

    const matchesShelf =
      !filters.shelf ||
      Number(productShelfId) === Number(filters.shelf);

    const productConditionId =
      product.condition?.[0]?.id;

    const matchesCondition =
      !filters.condition ||
      Number(productConditionId) === Number(filters.condition);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesShelf &&
      matchesCondition
    );
  });
};