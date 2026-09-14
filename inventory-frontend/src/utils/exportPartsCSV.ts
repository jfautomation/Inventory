import type { Part } from "../types";

export const exportPartsCSV = (parts: Part[]) => {
  const headers = [
    "ID",
    "Part Name",
    "Brand",
    "Category",
    "Series",
    "Base Price",
    "Description",
  ];

  const rows = parts.map((part) => [
    part.id,
    part.name || "",
    part.brand_id || "",
    part.category_id || "",
    part.series_id || "",
    part.base_price || "",
    part.description || "",
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
    [csvContent],
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