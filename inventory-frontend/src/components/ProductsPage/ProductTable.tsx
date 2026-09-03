import { useNavigate } from "react-router-dom";
import DataTable from "../UI/DataTable/DataTable";
import { productColumns } from "./productColumns";
import { useInventory } from "../../context/InventoryContext";
import type { Product } from "../../types";

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const ProductTable = ({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) => {
  const navigate = useNavigate();

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
      onRowClick={(product) =>
        navigate(`/product/${product.id}`)
      }
    />
  );
};

export default ProductTable;