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
  notes?: string;
  description?: string; // 👈 ADD THIS (frontend alias)
  test_date?: string;
  inventory_status?: "active" | "sold" | "archived";

  test_status?: boolean;
  quantity?: number;

  image?: string; // 👈 ADD THIS

  brand?: Term[];
  part?: Term[];
  shelf?: Term[];
  series?: Term[];
  condition?: Term[];
  inventory_category?: Term[];
};



export type ProductPayload = {
  serial_number?: string;
  work_order?: string;
  list_price?: number;
  notes?: string;

  image?: string; // 👈 ADD THIS

  test_date?: string;
  inventory_status?: "active" | "sold" | "archived";

  test_status?: boolean;

  part?: number[];
  brand?: number[];
  shelf?: number[];
  series?: number[];
  condition?: number[];

  status: "publish";
};