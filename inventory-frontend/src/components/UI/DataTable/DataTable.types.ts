import type { ReactNode } from "react";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];

  loading?: boolean;
  emptyMessage?: string;

  getRowKey?: (row: T) => string | number;

  // Table section header
  tableHeader?: string;
  tableHeaderIcon?: ReactNode;

  // Toolbar / filters
  toolbar?: ReactNode;

  // Optional footer
  footer?: ReactNode;
};