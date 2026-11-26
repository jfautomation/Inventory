
export interface Term {
  id: number;
  name: string;
  slug: string;
  price_percentage?: number | null;
}

export type Product = {
  id: number;
  title: string;
  product_listing_id?: number;
  serial_number?: string;
  work_order?: string;
  list_price?: number;
  price_mode?: "automatic" | "manual";
  image?: string;
  image_id?: number | null;
  notes?: string;
  short_description?: string;
  long_description?: string;
  description?: string;
  test_date?: string;
  inventory_status?: "active" | "sold" | "archived";
  test_status?: boolean;
  quantity?: number;

  brand?: Term[];
  part?: Term[];
  shelf?: Term[];
  condition?: Term[];
  seo_title?: string;
  meta_description?: string;
  search_terms?: string;
  inventory_category?: Term[];

  additional_image_ids?: number[];
  additional_image_urls?: string[];
};

export type Part = {
  id: number;
  name: string;
  slug?: string;
  part_number?: string;
  brand_id: number;
  category_id: number;
  series_id?: number | null;
  base_price?: number | null;
  description?: string;
  short_description?: string;
  long_description?: string;
  image_id?: number | null;
  image_url?: string | null;
  seo_title?: string;
  meta_description?: string;
  search_terms?: string;
  additional_image_ids?: number[];
  additional_image_urls?: string[];
  gtin?: string;
  google_product_category?: string;
};

export type ProductPayload = {
  product_listing_id: number;
  serial_number: string;
  work_order?: string;
  notes?: string;
  test_date?: string;
  test_status?: boolean;
  inventory_status?: "active" | "sold" | "archived";
  shelf?: number[];
  image_id?: number | null;
  status: "publish";
};

/**
 * Payload for creating or updating a Part.
 *
 * Catalogue descriptions, SEO, and images belong to the Part.
 */
export type CreatePartPayload = {
  name: string;
  part_number: string;
  brand_id: number;
  category_id: number;
  series_id?: number | null;
  base_price?: number | null;
  gtin?: string;
  google_product_category?: string;
  seo_title?: string;
  meta_description?: string;
  search_terms?: string;
  short_description: string;
  long_description: string;
  image_id?: number | null;
  additional_image_ids?: number[];
};

/**
 * Product Listing returned by the API.
 *
 * Catalogue fields are inherited from the associated Part.
 * They are available for display but are not editable through
 * the Product Listing payload.
 */
export type ProductListing = {
  id: number;
  title: string;
  sku: string;

  part_id: number;
  part_name?: string;
  part_number?: string;
  brand_id?: number;
  category_id?: number;
  series_id?: number | null;

  condition_id: number;

  // Variation-specific pricing.
  list_price?: number;
  price_mode?: "automatic" | "manual";

  // Inherited Part information (read-only).
  short_description?: string;
  long_description?: string;
  description?: string;
  seo_title?: string;
  meta_description?: string;
  search_terms?: string;

  gtin?: string;
  google_product_category?: string;

  image_id?: number | null;
  image_url?: string | null;
  additional_image_ids?: number[];
  additional_image_urls?: string[];

  // Listing-specific information.
  status?: "publish" | "draft";
  quantity?: number;
};

/**
 * Payload for creating or updating a Product Listing.
 *
 * Only variation-specific fields are accepted.
 * Part-owned catalogue information must be edited on the Part.
 */
export type ProductListingPayload = {
  sku?: string;
  part_id: number;
  condition_id: number;
  price_mode: "automatic" | "manual";
  list_price?: number;
  status: "publish" | "draft";
};
