
import { useState } from "react";

import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import { TaxonomyService } from "../../services/taxonomyService";

import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";
import DataTable from "../UI/DataTable/DataTable";

import InventoryFilters from "../ProductsPage/Inventory/InventoryFilters";
import { partColumns } from "./partColumns";

import type { Part } from "../../types";
import { filterParts } from "./filterParts";
import { exportPartsCSV } from "../../utils/exportPartsCSV";

import { Plus, Download, Package } from "lucide-react";

const PartsPage = () => {
  const { openPart, openEditPart } = useModal();

  const {
    parts,
    brands,
    categories,
    fetchParts,
    series,
  } = useInventory();

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
  };

  // Delete part
  const handleDeletePart = async (part: Part) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${part.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await TaxonomyService.deletePart(part.id);
      await fetchParts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete part.");
    }
  };

  // Filter parts
  const filteredParts = filterParts(
    parts,
    brands,
    categories,
    series,
    {
      search,
      category,
      brand,
    }
  );

  return (
    <PageContainer>
      {/* PAGE HEADER */}
      <PageHeader
        title="Parts"
        actions={
          <>
            <Button
              icon={<Plus size={18} />}
              label="Add Part"
              onClick={openPart}
            >
              Add Part
            </Button>

            <Button
              icon={<Download size={18} />}
              label="Export Parts"
              variant="grey"
              onClick={() => exportPartsCSV(filteredParts)}
            >
              Export
            </Button>
          </>
        }
      />

      {/* PARTS TABLE */}
      <DataTable
        columns={partColumns(
          brands,
          categories,
          openEditPart,
          handleDeletePart
        )}
        data={filteredParts}
        getRowKey={(part) => part.id}
        tableHeader="Parts Inventory"
        tableHeaderIcon={<Package size={20} />}
        toolbar={
          <InventoryFilters
            entityName="Parts"
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

export default PartsPage;
