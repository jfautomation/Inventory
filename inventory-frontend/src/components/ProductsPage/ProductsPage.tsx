
import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";

import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";

import InventoryFilters from "./Inventory/InventoryFilters";
import ProductListingTable from "./ProductListingTable";

import { filterProductListings } from "./Inventory/productListingFilters";

import { Plus, Package } from "lucide-react";

const ProductsPage = () => {
  const { openProduct } = useModal();

  const { productListings, parts } = useInventory();

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
  };

  // Only display listings that have stock
  const inStockListings = productListings.filter(
    (listing) => Number(listing.quantity ?? 0) > 0
  );

  // Apply search and filters
  const filteredListings = filterProductListings(
    inStockListings,
    parts,
    {
      search,
      category,
      brand,
    }
  );

  return (
    <PageContainer>
      <PageHeader
        title="Products"
        actions={
          <Button
            icon={<Plus size={18} />}
            label="Add Product"
            onClick={openProduct}
          >
            Add Product
          </Button>
        }
      />

      <ProductListingTable
        listings={filteredListings}
        tableHeader="Product Listings Inventory"
        tableHeaderIcon={<Package size={20} />}
        toolbar={
          <InventoryFilters
            entityName="Product Listings"
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
