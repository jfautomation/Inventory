import { Product } from "../types";

export const normalizeProduct = (p: any): Product => {
  return {
    id: p.id,

    // =========================
    // TITLE (ALWAYS STRING NOW)
    // =========================
    title: typeof p.title === "string"
  ? p.title
  : p.title?.rendered ?? "",

    // =========================
    // TAXONOMIES
    // =========================
    part: p.part || [],
    brand: p.brand || [],
    inventory_category: p.inventory_category || [],
    shelf: p.shelf || [],
    condition: p.condition || [],
    series: p.series || [],

    // =========================
    // META
    // =========================
    serial_number: p.serial_number || "",
    work_order: p.work_order || "",

    test_status: !!p.test_status,
    test_date: p.test_date || "",

    // =========================
    // PRICE
    // =========================
    list_price:
      p.list_price === "" || p.list_price == null
        ? 0
        : Number(p.list_price),

    // =========================
    // TEXT
    // =========================
    notes: p.notes || "",
    description: p.description || p.notes || "",

    // =========================
    // IMAGE
    // =========================
    image: p.image || "",
    image_id: p.image_id || 0,

    // =========================
    // STATUS
    // =========================
    inventory_status: p.inventory_status || "active",

    // =========================
    // DERIVED
    // =========================
    quantity: p.quantity ? Number(p.quantity) : 0,
  };
};