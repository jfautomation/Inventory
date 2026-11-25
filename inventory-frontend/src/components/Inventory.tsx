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
import { exportMasterWorkbook } from "../services/masterWorkbookService";

import { Plus, Package, Download } from "lucide-react";

const Inventory: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  const { openProduct } = useModal();

  const {
    productListings,
    parts,
    products,
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

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleExportMasterWorkbook = async () => {
    try {
      await exportMasterWorkbook(parts, productListings, products);
      setIsImportExportOpen(false);
    } catch (error) {
      console.error("Master workbook export failed:", error);
      alert("Unable to export the master workbook.");
    }
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
          <>
            <Button
              icon={<Plus size={18} />}
              label="Add Product"
              onClick={openProduct}
            >
              Add Product
            </Button>

            <div style={{ position: "relative" }}>
              <Button
                icon={<Download size={18} />}
                label="Import / Export"
                variant="grey"
                onClick={() =>
                  setIsImportExportOpen((previous) => !previous)
                }
              >
                Import / Export
              </Button>

              {isImportExportOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    minWidth: "220px",
                    padding: "8px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    zIndex: 100,
                  }}
                >
                  <button
                    type="button"
                    onClick={handleExportMasterWorkbook}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "10px",
                      border: "none",
                      borderRadius: "6px",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "14px",
                    }}
                  >
                    <Download size={16} />
                    Export Master Workbook
                  </button>

                  <div
                    style={{
                      padding: "10px",
                      color: "#9ca3af",
                      fontSize: "13px",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    Import Master Workbook
                    <div style={{ fontSize: "11px", marginTop: "3px" }}>
                      Coming next
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
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