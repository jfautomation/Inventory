export interface Term {
  id: number;
  name: string;
  slug: string;
}

export type Product = {
  id: number;
  title: string; // ✅ REQUIRED (eBay, website, shop)
  serial_number?: string;
  work_order?: string;
  list_price?: number;
  image?: string;
  image_id?: number;
  notes?: string;
  description?: string; // 👈 ADD THIS (frontend alias)
  test_date?: string;
  inventory_status?: "active" | "sold" | "archived";

  test_status?: boolean;
  quantity?: number;


  brand?: Term[];
  part?: Term[];
  shelf?: Term[];
  series?: Term[];
  condition?: Term[];
  inventory_category?: Term[];
};

export type Part = {
  id: number;
  name: string;

  brand_id?: number;
  category_id?: number;

  image_id?: number;

  category?: Term | null;
  brand?: Term | null;
};



export type ProductPayload = {
  title: string;

  serial_number?: string;
  work_order?: string;
  list_price?: number;
  notes?: string;

  image_id?: number;

  test_date?: string;

  inventory_status?: "active" | "sold" | "archived";

  test_status?: boolean;

  part?: number[];
  brand?: number[];
  shelf?: number[];
  series?: number[];
  condition?: number[];
  inventory_category?: number[];

  status: "publish";
};

export type CreatePartPayload = {
  name: string;
  brand_id: number;
  category_id?: number;
  image_id?: number; // ✅ ADD THIS
};