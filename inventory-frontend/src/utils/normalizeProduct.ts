import { Product } from "../types";

export const normalizeProduct = (p: any): Product => ({
  id: p.id,
  title:
    typeof p.title === "string"
      ? p.title
      : typeof p.title === "object" && p.title?.rendered
        ? p.title.rendered
        : "",
  brand: p.brand || [],
  part: p.part || [],
  shelf: p.shelf || [],
  series: p.series || [],
  serial_number: p.serial_number || "",
  work_order: p.work_order || "",
  test_status: Boolean(Number(p.test_status)),
  condition: p.condition || "",
  list_price: p.list_price || "",
  notes: p.notes || "",
  test_date: p.test_date || "",
});