
import { Product } from "../types";

export const normalizeProduct = (p: any): Product => {
  return {
    id: p.id,

    // TITLE
    title:
      typeof p.title === "string"
        ? p.title
        : p.title?.rendered ?? "",

    // PRODUCT LISTING RELATIONSHIP
    product_listing_id: Number(p.product_listing_id) || 0,

    // TAXONOMIES
    part: p.part || [],
    brand: p.brand || [],
    inventory_category: p.inventory_category || [],
    shelf: p.shelf || [],
    condition: p.condition || [],

    // SERIALIZED PRODUCT DETAILS
    serial_number: p.serial_number || "",
    work_order: p.work_order || "",
    notes: p.notes || "",

    // TESTING
    test_status: !!p.test_status,
    test_date: p.test_date || "",

    // PRICE
    list_price:
      p.list_price === "" || p.list_price == null
        ? 0
        : Number(p.list_price),

    price_mode: p.price_mode || "automatic",

    // DESCRIPTIONS AND SEO
    description: p.description || p.notes || "",
    short_description: p.short_description || "",
    long_description: p.long_description || "",
    seo_title: p.seo_title || "",
    meta_description: p.meta_description || "",
    search_terms: p.search_terms || "",

    // IMAGES
    image: p.image || "",
    image_id: p.image_id ?? null,
    additional_image_ids: p.additional_image_ids || [],
    additional_image_urls: p.additional_image_urls || [],

    // INVENTORY STATUS
    inventory_status: p.inventory_status || "active",

    // DERIVED QUANTITY
    quantity: Number(p.quantity) || 0,
  };
};
