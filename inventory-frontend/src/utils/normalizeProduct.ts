import { Product } from "../types";

export const normalizeProduct = (p: any): Product => ({
  id: p.id,
   title:
    p.title ||
    `${p.brand?.[0]?.name || ""} ${p.part?.[0]?.name || ""} ${p.serial_number || ""}`.trim(),

  // =========================
  // TAXONOMY RELATIONS
  // =========================
  part: p.part || [],
  brand: p.brand || [],
  inventory_category: p.inventory_category || [],
  shelf: p.shelf || [],
  condition: p.condition || [],
  series: p.series || [],

  // =========================
  // META FIELDS
  // =========================
  serial_number: p.serial_number || "",
  work_order: p.work_order || "",

  test_status:
    p.test_status === true ||
    p.test_status === 1 ||
    p.test_status === "1",

  test_date: p.test_date || "",

  // =========================
  // PRICE
  // =========================
  list_price:
    p.list_price === "" ||
    p.list_price === null ||
    p.list_price === undefined
      ? 0
      : Number(p.list_price),

  // =========================
  // TEXT FIELDS
  // =========================
  notes: p.notes || "",

  // 👇 ALIAS for spreadsheet / UI consistency
  description: p.description || p.notes || "",

  // =========================
  // IMAGE
  // =========================
  image: p.image || "",

  // =========================
  // INVENTORY STATUS
  // =========================
  inventory_status:
    p.inventory_status === "active" ||
    p.inventory_status === "sold" ||
    p.inventory_status === "archived"
      ? p.inventory_status
      : "active",

  // =========================
  // DERIVED FIELDS
  // =========================
  quantity:
    p.quantity === "" ||
    p.quantity === null ||
    p.quantity === undefined
      ? 0
      : Number(p.quantity),
});