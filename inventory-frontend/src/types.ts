
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

export type CreatePartPayload = {
  name: string;
  part_number: string;
  brand_id: number;
  category_id: number;
  series_id?: number | null;
  base_price?: number | null;
  seo_title?: string;
  meta_description?: string;
  search_terms?: string;
  short_description: string;
  long_description: string;
  image_id?: number | null;
  additional_image_ids?: number[];
};

export type ProductListing = {
  id: number;
  title: string;
  sku: string;
  part_id: number;
  condition_id: number;
  list_price?: number;
  price_mode?: "automatic" | "manual";
  short_description?: string;
  long_description?: string;
  seo_title?: string;
  meta_description?: string;
  search_terms?: string;
  image_id?: number | null;
  image_url?: string | null;
  additional_image_ids?: number[];
  additional_image_urls?: string[];
  status?: "publish" | "draft";
  quantity?: number;
};

export type ProductListingPayload = {
  title?: string;
  sku?: string;
  part_id: number;
  condition_id: number;
  price_mode: "automatic" | "manual";
  list_price?: number;
  short_description?: string;
  long_description?: string;
  seo_title?: string;
  meta_description?: string;
  search_terms?: string;
  image_id?: number | null;
  additional_image_ids?: number[];
  status: "publish" | "draft";
};
