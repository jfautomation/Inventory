import type { ReactNode } from "react";


export type Column<T> = {
  key: keyof T | string;
  label: string;

  // Optional custom rendering
  render?: (row: T) => ReactNode;

  // Future-ready
  sortable?: boolean;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];

  onRowClick?: (row: T) => void;

  loading?: boolean;

  getRowKey?: (row: T) => string | number;
};