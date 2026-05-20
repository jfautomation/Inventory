export interface Term {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;

  part: Term[];

  brand?: Term[];
  inventory_category?: Term[];
  shelf?: Term[];

  serial_number?: string;
  work_order?: string;
  condition?: string;

  test_status?: boolean;
  test_date?: string;

  list_price?: string;
  notes?: string;
}

export interface ProductPayload {
  status?: "publish" | "draft";
  part: number[];

  serial_number?: string;
  work_order?: string;
  condition?: string;
  shelf?: number[];

  test_status?: number;
  test_date?: string;
  list_price?: string;
  notes?: string;
}