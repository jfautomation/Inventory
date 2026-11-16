
import React, { useEffect, useState } from "react";

import PageContainer from "./UI/PageContainer";
import PageHeader from "./UI/PageHeader";
import Button from "../components/UI/Button/Button";

import { useModal } from "../context/ModalContext";
import { useInventory } from "../context/InventoryContext";
import { getToken } from "../api/client";

import Login from "./Login/Login";
import InventoryFilters from "./ProductsPage/Inventory/InventoryFilters";
import ProductListingTable from "./ProductsPage/ProductListingTable";

import { filterProductListings } from "./ProductsPage/Inventory/productListingFilters";
import { Plus, Package } from "lucide-react";

const Inventory: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { openProduct } = useModal();

  const { productListings, parts, isLoading } = useInventory();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
  };

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  const inStockListings = productListings.filter(
    (listing) => Number(listing.quantity ?? 0) > 0
  );

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
        title="Dashboard: Inventory"
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

export default Inventory;
