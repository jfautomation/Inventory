import type { ReactNode } from "react";
import DataTable from "../UI/DataTable/DataTable";
import { productColumns } from "./productColumns";
import { useInventory } from "../../context/InventoryContext";
import type { Product } from "../../types";

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;

  tableHeader?: string;
  tableHeaderIcon?: ReactNode;
  toolbar?: ReactNode;
};

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  tableHeader,
  tableHeaderIcon,
  toolbar,
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
      toolbar={toolbar}
      tableHeader={tableHeader}
      tableHeaderIcon={tableHeaderIcon}
    />
  );
};

export default ProductTable;