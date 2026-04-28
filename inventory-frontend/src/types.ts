export interface Product {
  id: number;
  title: string;

  brand: number[];
  part: number[];
  shelf: number[];
  series: number[];

  serial_number?: string;
  work_order?: string;
  test_status?: boolean;
  condition?: string;
  list_price?: string;
  notes?: string;
  test_date?: string;
}

export interface Term {
    id: number;
    name: string;
}