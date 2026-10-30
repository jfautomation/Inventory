import React, { useEffect, useState } from "react";
import { exportProductsCSV } from "../utils/exportCSV";
import PageContainer from "./UI/PageContainer";
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
import { Plus, Download, Package } from "lucide-react";
import PageHeader from "./UI/PageHeader";

const Inventory: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    openProduct,
    openEditProduct,
  } = useModal();

  const {
    products,
    parts,
    fetchProducts,
    isLoading,
  } = useInventory();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
  };

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // =========================================================
  // LOGIN GATE
  // =========================================================

  if (!isLoggedIn) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  // =========================================================
  // INVENTORY LOADING
  // =========================================================

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await ProductService.delete(product.id);

      await fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  // =========================================================
  // RECENT PRODUCTS
  // =========================================================

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
    }
  );

  // =========================================================
  // UI
  // =========================================================



  return (
    <PageContainer>
      <PageHeader
        title="Dashboard: Inventory"
        actions={
          <div className="flex items-center gap-3">
            <Button
              icon={<Plus size={18} />}
              label="Add Product"
              onClick={openProduct}
            >
              Add Product
            </Button>

            <Button
              icon={<Download size={18} />}
              label="Export Products"
              variant="grey"
              onClick={() => exportProductsCSV(filteredRecentProducts)}
            >
              Export
            </Button>
          </div>
        }
      />

      <ProductTable
        products={filteredRecentProducts}
        onEdit={openEditProduct}
        onDelete={handleDeleteProduct}
        tableHeader="Products Inventory"
        tableHeaderIcon={<Package size={20} />}
        toolbar={
          <InventoryFilters
            entityName="Products"
            searchValue={search}
            onSearchChange={setSearch}
            categoryValue={category}
            onCategoryChange={setCategory}
            brandValue={brand}
            onBrandChange={setBrand}
            onClearFilters={handleClearFilters}
          />
        }
      />
    </PageContainer>
  );
};

export default Inventory;