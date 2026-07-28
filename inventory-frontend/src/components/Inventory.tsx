import React, { useEffect, useState } from "react";
import { exportProductsCSV } from "../utils/exportCSV";
import PageContainer from "./UI/PageContainer";
import PageHeader from "./UI/PageHeader";
import { useModal } from "../context/ModalContext";
import { useInventory } from "../context/InventoryContext";
import Login from "./Login/Login";
import { getToken } from "../api/client";
import { ProductService } from "../services/productService";
import Button from "../components/UI/Button/Button";
import InventoryFilters from "./ProductsPage/Inventory/InventoryFilters";
import DataTable from "./UI/DataTable/DataTable";
import { useNavigate } from "react-router-dom";
import { productColumns } from "../components/ProductsPage/productColumns"


const Inventory: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { openProduct } = useModal();
  const navigate = useNavigate();

  // ✅ GLOBAL STATE (this replaces local state)
  const {
    products,
    refreshInventory,
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
  // DELETE PRODUCT
  // =========================
  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.delete(id);

      // 🔥 refresh global state
      await refreshInventory();
    } catch (err) {
      console.error("Delete failed:", err);
    }
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
    return (
      <div>
        Loading inventory...
      </div>
    );
  }


  const recentProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);




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
      <hr
        className="
    border-gray-200
  "
      />

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

export default Inventory;