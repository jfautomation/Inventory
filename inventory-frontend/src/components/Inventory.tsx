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
import ProductTable from "./ProductsPage/ProductTable";
import { ProductService } from "../services/productService";
import type { Product } from "../types";
import { filterProducts } from "./ProductsPage/productFilters";

const Inventory: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    openProduct,
    openEditProduct,
  } = useModal();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [shelf, setShelf] = useState("");
  const [condition, setCondition] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setShelf("");
    setCondition("");
  };

  const {
    products,
    parts,
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

  const filteredRecentProducts = filterProducts(
    recentProducts,
    parts,
    {
      search,
      category,
      brand,
      shelf,
      condition,
    }
  );

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

        <InventoryFilters
          entityName="Products"
          searchValue={search}
          onSearchChange={setSearch}
          categoryValue={category}
          onCategoryChange={setCategory}
          brandValue={brand}
          onBrandChange={setBrand}
          shelfValue={shelf}
          onShelfChange={setShelf}
          conditionValue={condition}
          onConditionChange={setCondition}
          onClearFilters={handleClearFilters}
        />

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

          <ProductTable
            products={filteredRecentProducts}
            onEdit={openEditProduct}
            onDelete={handleDeleteProduct}
          />
        </div>

      </div>
    </PageContainer>
  );
};

export default Inventory;