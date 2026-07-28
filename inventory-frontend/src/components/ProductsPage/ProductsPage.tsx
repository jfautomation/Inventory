import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import { ProductService } from "../../services/productService";
import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";
import InventoryFilters from "./Inventory/InventoryFilters";
import DataTable from "../UI/DataTable/DataTable";
import { productColumns } from "./productColumns"

const ProductsPage = () => {
  const navigate = useNavigate();

  const { openProduct, openEditProduct } = useModal();

  // ✅ GLOBAL STATE (single source of truth)
  const {
    products,
    fetchProducts,
    refreshInventory,
  } = useInventory();

  // =========================
  // INIT LOAD
  // =========================
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // =========================
  // DELETE
  // =========================
  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.delete(id);

      // ✅ refresh global state
      await refreshInventory();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const recentProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  // =========================
  // UI
  // =========================
  return (
    <PageContainer>

      <PageHeader title="Products Inventory">

        <Button onClick={openProduct}>
          Add Product
        </Button>

      </PageHeader>

      <div className="p-4">

        <InventoryFilters entityName="Products" />

        <div className="mt-6">

          <DataTable
            columns={productColumns}
            data={recentProducts}
            getRowKey={(product) => product.id}
            onRowClick={(product) =>
              navigate(`/product/${product.id}`)
            }
          />
        </div>

      </div>

    </PageContainer>
  );
};

export default ProductsPage;