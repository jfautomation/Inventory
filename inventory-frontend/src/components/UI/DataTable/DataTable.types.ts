import type { ReactNode } from "react";
import type { BreadcrumbItem } from "../Breadcrumbs";



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

  loading?: boolean;

  getRowKey?: (row: T) => string | number;

  // Table header
  headerTitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: ReactNode;
  toolbar?: ReactNode;
};