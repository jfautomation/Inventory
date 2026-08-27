import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import { ProductService } from "../../services/productService";
import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";
import InventoryFilters from "./Inventory/InventoryFilters";
import DataTable from "../UI/DataTable/DataTable";
import { productColumns } from "./productColumns";
import type { Product } from "../../types";

const ProductsPage = () => {
  const navigate = useNavigate();

  const {
    openProduct,
    openEditProduct,
  } = useModal();

  const {
    products,
    fetchProducts,
  } = useInventory();

  // =====================================
  // DELETE PRODUCT
  // =====================================

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await ProductService.delete(product.id);

      // Refresh products only
      await fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  const recentProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

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
            columns={productColumns(
              openEditProduct,
              handleDeleteProduct
            )}
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