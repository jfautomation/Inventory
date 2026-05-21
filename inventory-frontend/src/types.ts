export interface Term {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;

  part: Term[];

  brand: Term[];
  inventory_category: Term[];
  shelf: Term[];
  condition: Term[];

  series: Term[]; // ✅ ADD THIS

  serial_number?: string;
  work_order?: string;

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

  condition?: number[];
  shelf?: number[];
  series?: number[]; // ✅ correct

  test_status?: boolean; // ✅ consistent end-to-end
  test_date?: string;
  list_price?: string;
  notes?: string;
}