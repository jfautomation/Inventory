export interface Term {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  title: string;

  brand: Term[];
  part: Term[];
  shelf: Term[];
  series: Term[];

  serial_number?: string;
  work_order?: string;
  test_status?: boolean;
  condition?: string;
  list_price?: string;
  notes?: string;
  test_date?: string;
}

export type ProductPayload = {
  title: string;
  status: "publish";
  brand: number[];
  serial_number: string;
  work_order: string;
  test_status: number;
  condition: string;
  list_price: string;
  notes: string;
  test_date: string;
};