import { Product } from "../types";

export const normalizeProduct = (p: any): Product => ({
  id: p.id,

  // taxonomy relations
  part: p.part || [],
  brand: p.brand || [],
  inventory_category: p.inventory_category || [],

  // meta
  serial_number: p.serial_number || "",
  work_order: p.work_order || "",
  condition: p.condition || "",

  test_status: Boolean(p.test_status),
  test_date: p.test_date || "",

  list_price: p.list_price || "",
  notes: p.notes || "",
});