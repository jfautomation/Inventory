import { useState } from "react";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import PageContainer from "../UI/PageContainer";
import Button from "../UI/Button/Button";
import InventoryFilters from "../ProductsPage/Inventory/InventoryFilters";
import DataTable from "../UI/DataTable/DataTable";
import { partColumns } from "./partColumns";
import { TaxonomyService } from "../../services/taxonomyService";
import { Part } from "../../types";
import { filterParts } from "./filterParts";
import { exportPartsCSV } from "../../utils/exportPartsCSV";

const PartsPage = () => {
  const {
    openPart,
    openEditPart,
  } = useModal();

  const {
    parts,
    brands,
    categories,
    fetchParts,
    series,
  } = useInventory();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
  };

  const handleDeletePart = async (part: Part) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${part.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await TaxonomyService.deletePart(part.id);
      await fetchParts();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete part.");
    }
  };

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

      {/* ===================================================
            TABLE
        =================================================== */}



      <DataTable
        columns={partColumns(
          brands,
          categories,
          openEditPart,
          handleDeletePart
        )}
        data={filteredParts}
        getRowKey={(part) => part.id}
        headerTitle="Parts Inventory"
        breadcrumbs={[
          {
            label: "Parts",
            path: "/parts",
          },
        ]}
        headerActions={
          <div className="flex items-center gap-3">
            <Button onClick={openPart}>
              Add Part
            </Button>

            <Button
              onClick={() => exportPartsCSV(filteredParts)}
              variant="secondary"
            >
              Export
            </Button>
          </div>
        }
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