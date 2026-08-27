import React, { useEffect, useState } from "react";
import { exportProductsCSV } from "../utils/exportCSV";
import PageContainer from "./UI/PageContainer";
import PageHeader from "./UI/PageHeader";
import { useModal } from "../context/ModalContext";
import { useInventory } from "../context/InventoryContext";
import Login from "./Login/Login";
import { getToken } from "../api/client";
import Button from "../components/UI/Button/Button";
import InventoryFilters from "./ProductsPage/Inventory/InventoryFilters";
import DataTable from "./UI/DataTable/DataTable";
import { useNavigate } from "react-router-dom";
import { productColumns } from "../components/ProductsPage/productColumns";
import { ProductService } from "../services/productService";
import type { Product } from "../types";

const Inventory: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    openProduct,
    openEditProduct,
  } = useModal();

  const navigate = useNavigate();

  const {
    products,
    fetchProducts,
    isLoading,
  } = useInventory();

  // =========================
  // AUTH CHECK
  // =========================

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // =========================
  // LOGIN GATE
  // =========================

  if (!isLoggedIn) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  // =========================
  // INVENTORY LOADING
  // =========================

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  // =========================
  // DELETE PRODUCT
  // =========================

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

  // =========================
  // RECENT PRODUCTS
  // =========================

  const recentProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  // =========================
  // UI
  // =========================

  return (
    <PageContainer>
      <PageHeader title="Dashboard: Inventory">

        <Button onClick={openProduct}>
          Add Product
        </Button>

        <Button
          onClick={() => exportProductsCSV(products)}
          variant="secondary"
        >
          Export
        </Button>

      </PageHeader>

      <div className="p-4">

        <InventoryFilters entityName="Products" />

        <div className="mt-6">

          <h3
            className="
              text-lg
              font-semibold
              mb-4
            "
          >
            Recently Added Products
          </h3>

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

export default Inventory;