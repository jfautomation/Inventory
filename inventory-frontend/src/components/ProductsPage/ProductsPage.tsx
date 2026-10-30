import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import { ProductService } from "../../services/productService";

import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";

import InventoryFilters from "./Inventory/InventoryFilters";
import ProductTable from "./ProductTable";

import type { Product } from "../../types";
import { filterProducts } from "./productFilters";
import { exportProductsCSV } from "../../utils/exportCSV";

import { Plus, Download, Package } from "lucide-react";

const ProductsPage = () => {
  const { openProduct, openEditProduct } = useModal();
  const { products, parts, fetchProducts } = useInventory();

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
  };

  // Delete product
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await ProductService.delete(product.id);
      await fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  // Filter products
  const filteredProducts = filterProducts(products, parts, {
    search,
    category,
    brand,
  });

  return (
    <PageContainer>
      {/* PAGE HEADER */}
      <PageHeader
        title="Products"
        actions={
          <>
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
              onClick={() => exportProductsCSV(filteredProducts)}
            >
              Export
            </Button>
          </>
        }
      />

      {/* PRODUCT TABLE */}
      <ProductTable
        products={filteredProducts}
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

export default ProductsPage;