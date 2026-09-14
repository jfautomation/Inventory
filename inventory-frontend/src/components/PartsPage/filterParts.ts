import type { Part, Term } from "../../types";

type PartFilterValues = {
  search: string;
  category: string;
  brand: string;
};

export const filterParts = (
  parts: Part[],
  brands: Term[],
  categories: Term[],
  series: Term[],
  filters: PartFilterValues
): Part[] => {
  const searchTerm = filters.search.trim().toLowerCase();

  return parts.filter((part) => {
    const partName = part.name?.toLowerCase() || "";

    const brandName =
      brands.find(
        (brand) => Number(brand.id) === Number(part.brand_id)
      )?.name?.toLowerCase() || "";

    const categoryName =
      categories.find(
        (category) =>
          Number(category.id) === Number(part.category_id)
      )?.name?.toLowerCase() || "";

    const seriesName =
      series.find(
        (item) => Number(item.id) === Number(part.series_id)
      )?.name?.toLowerCase() || "";

    const matchesSearch =
      !searchTerm ||
      partName.includes(searchTerm) ||
      brandName.includes(searchTerm) ||
      categoryName.includes(searchTerm) ||
      seriesName.includes(searchTerm);

    const matchesBrand =
      !filters.brand ||
      Number(part.brand_id) === Number(filters.brand);

    const matchesCategory =
      !filters.category ||
      Number(part.category_id) === Number(filters.category);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand
    );
  });
};