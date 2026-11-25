import type { Part } from "../types";

export const exportPartsCSV = (parts: Part[]) => {
  const headers = [
    "ID",
    "Name",
    "Part Number",
    "Brand ID",
    "Category ID",
    "Series ID",
    "Base Price",
    "Description",
    "Short Description",
    "Long Description",
    "Image ID",
    "Additional Image IDs",
    "SEO Title",
    "Meta Description",
    "Search Terms",
  ];

  const rows = parts.map((part) => [
    part.id,
    part.name ?? "",
    part.part_number ?? "",
    part.brand_id,
    part.category_id,
    part.series_id ?? "",
    part.base_price ?? "",
    part.description ?? "",
    part.short_description ?? "",
    part.long_description ?? "",
    part.image_id ?? "",
    (part.additional_image_ids ?? []).join(";"),
    part.seo_title ?? "",
    part.meta_description ?? "",
    part.search_terms ?? "",
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
  link.download = "inventory_parts.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};