
import type { ProductListing, Part } from "../../../types"

type ProductListingFilterValues = {
  search: string;
  category: string;
  brand: string;
};

export const filterProductListings = (
  listings: ProductListing[],
  parts: Part[],
  filters: ProductListingFilterValues
): ProductListing[] => {
  const searchTerm = filters.search.trim().toLowerCase();

  return listings.filter((listing) => {
    const part = parts.find(
      (item) => Number(item.id) === Number(listing.part_id)
    );

    const listingTitle = listing.title?.toLowerCase() || "";
    const sku = listing.sku?.toLowerCase() || "";
    const partName = part?.name?.toLowerCase() || "";
    const partNumber = part?.part_number?.toLowerCase() || "";

    const matchesSearch =
      !searchTerm ||
      listingTitle.includes(searchTerm) ||
      sku.includes(searchTerm) ||
      partName.includes(searchTerm) ||
      partNumber.includes(searchTerm);

    const matchesBrand =
      !filters.brand ||
      Number(part?.brand_id) === Number(filters.brand);

    const matchesCategory =
      !filters.category ||
      Number(part?.category_id) === Number(filters.category);

    return matchesSearch && matchesBrand && matchesCategory;
  });
};
