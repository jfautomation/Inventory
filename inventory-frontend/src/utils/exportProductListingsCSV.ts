import type { ProductListing } from "../types";

export const exportProductListingsCSV = (
  listings: ProductListing[]
) => {
  const headers = [
    "ID",
    "Title",
    "SKU",
    "Part ID",
    "Condition ID",
    "Price Mode",
    "List Price",
    "Quantity",
    "Status",
    "Short Description",
    "Long Description",
    "SEO Title",
    "Meta Description",
    "Search Terms",
    "Image ID",
    "Additional Image IDs",
  ];

  const rows = listings.map((listing) => [
    listing.id,
    listing.title ?? "",
    listing.sku ?? "",
    listing.part_id,
    listing.condition_id,
    listing.price_mode ?? "",
    listing.list_price ?? "",
    listing.quantity ?? "",
    listing.status ?? "",
    listing.short_description ?? "",
    listing.long_description ?? "",
    listing.seo_title ?? "",
    listing.meta_description ?? "",
    listing.search_terms ?? "",
    listing.image_id ?? "",
    (listing.additional_image_ids ?? []).join(";"),
  ]);

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "inventory_product_listings.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};