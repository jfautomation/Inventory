import type { ReactNode } from "react";
import DataTable from "../UI/DataTable/DataTable";
import { productColumns } from "./productColumns";
import { useInventory } from "../../context/InventoryContext";
import type { Product } from "../../types";
import type { BreadcrumbItem } from "../UI/Breadcrumbs";

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;

  headerTitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: ReactNode;
  toolbar?: ReactNode;

  tableHeader?: string;
  tableHeaderIcon?: ReactNode;
};

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  headerTitle,
  breadcrumbs,
  headerActions,
  toolbar,
  tableHeader,
  tableHeaderIcon,
}: ProductTableProps) => {
  const { parts, categories } = useInventory();

  return (
    <DataTable
      columns={productColumns(
        parts,
        categories,
        onEdit,
        onDelete
      )}
      data={products}
      getRowKey={(product) => product.id}
      headerTitle={headerTitle}
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
      toolbar={toolbar}
      tableHeader={tableHeader}
      tableHeaderIcon={tableHeaderIcon}
    />
  );
};

export default ProductTable;
