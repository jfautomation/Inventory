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

const ProductsPage = () => {


  const {
    openProduct,
    openEditProduct,
  } = useModal();

  const {
    products,
    parts,
    fetchProducts,
  } = useInventory();


  // =====================================
  // FILTER STATE
  // =====================================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [shelf, setShelf] = useState("");
  const [condition, setCondition] = useState("");

  // FILTER CLEAR FUNCTION
  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setShelf("");
    setCondition("");
  };

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

  const filteredProducts = filterProducts(
    products,
    parts,
    {
      search,
      category,
      brand,
    }
  );

  // =====================================
  // UI
  // =====================================

  return (
    <PageContainer>

      <PageHeader title="Products Inventory">

        <div className="flex items-center gap-3">

          <Button onClick={openProduct}>
            Add Product
          </Button>

          <Button
            onClick={() => exportProductsCSV(filteredProducts)}
            variant="secondary"
          >
            Export
          </Button>

        </div>

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

          onClearFilters={handleClearFilters}
        />

        <div className="mt-6">

          <ProductTable
            products={filteredProducts}
            onEdit={openEditProduct}
            onDelete={handleDeleteProduct}
          />

        </div>

      </div>

    </PageContainer>
  );
};

export default ProductsPage;

