import { useState } from "react";
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
  // FILTER STATE
  // =====================================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [shelf, setShelf] = useState("");
  const [condition, setCondition] = useState("");

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

  // =====================================
  // FILTER PRODUCTS
  // =====================================

  const searchTerm = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    // -------------------------------------
    // SEARCH
    // -------------------------------------

    const partName =
      product.part?.[0]?.name?.toLowerCase() || "";

    const productTitle =
      product.title?.toLowerCase() || "";

    const serialNumber =
      product.serial_number?.toLowerCase() || "";

    const workOrder =
      product.work_order?.toLowerCase() || "";

    const brandName =
      product.brand?.[0]?.name?.toLowerCase() || "";

    const conditionName =
      product.condition?.[0]?.name?.toLowerCase() || "";

    const matchesSearch =
      !searchTerm ||
      partName.includes(searchTerm) ||
      productTitle.includes(searchTerm) ||
      serialNumber.includes(searchTerm) ||
      workOrder.includes(searchTerm) ||
      brandName.includes(searchTerm) ||
      conditionName.includes(searchTerm);

    // -------------------------------------
    // BRAND
    // -------------------------------------

    const productBrandId =
      product.brand?.[0]?.id;

    const matchesBrand =
      !brand ||
      Number(productBrandId) === Number(brand);

    // -------------------------------------
    // SHELF
    // -------------------------------------

    const productShelfId =
      product.shelf?.[0]?.id;

    const matchesShelf =
      !shelf ||
      Number(productShelfId) === Number(shelf);

    // -------------------------------------
    // CONDITION
    // -------------------------------------

    const productConditionId =
      product.condition?.[0]?.id;

    const matchesCondition =
      !condition ||
      Number(productConditionId) === Number(condition);

    return (
      matchesSearch &&
      matchesBrand &&
      matchesShelf &&
      matchesCondition
    );
  });

  // =====================================
  // UI
  // =====================================

  return (
    <PageContainer>

      <PageHeader title="Products Inventory">

        <Button onClick={openProduct}>
          Add Product
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
        />

        <div className="mt-6">

          <DataTable
            columns={productColumns(
              openEditProduct,
              handleDeleteProduct
            )}
            data={filteredProducts}
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

