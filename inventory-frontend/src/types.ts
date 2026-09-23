export interface Term {

  id: number;

  name: string;

  slug: string;

  price_percentage?: number | null;

}

export type Product = {
  id: number;
  title: string; // ✅ REQUIRED (eBay, website, shop)
  serial_number?: string;
  work_order?: string;
  list_price?: number;
  price_mode?: "automatic" | "manual";
  image?: string;
  image_id?: number | null;
  notes?: string;
  description?: string; // 👈 frontend alias
  test_date?: string;
  inventory_status?: "active" | "sold" | "archived";
  test_status?: boolean;
  quantity?: number;

  brand?: Term[];
  part?: Term[];
  shelf?: Term[];
  condition?: Term[];
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

  additional_image_ids?: number[];
  
  additional_image_urls?: string[];

};



export type ProductPayload = {
    title: string;
    serial_number?: string;
    work_order?: string;
    list_price?: number;
    price_mode?: "automatic" | "manual";
    notes?: string;
    image_id?: number | null;
    test_date?: string;
    inventory_status?:
        | "active"
        | "sold"
        | "archived";
    test_status?: boolean;
    part?: number[];
    brand?: number[];
    shelf?: number[];
    series?: number[];
    condition?: number[];
    inventory_category?: number[];
    additional_image_ids?: number[];
    status: "publish";
};

export type CreatePartPayload = {

  name: string;

  part_number: string;

  brand_id: number;

  category_id: number;

  series_id?: number | null;

  base_price?: number | null;

  short_description: string;

  long_description: string;

  image_id?: number | null;

  additional_image_ids?: number[];

};