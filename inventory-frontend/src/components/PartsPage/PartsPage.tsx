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
import { Plus, Download } from "lucide-react";

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
        headerTitle="Parts"
        breadcrumbs={[
          {
            label: "Parts",
            path: "/parts",
          },
        ]}
        headerActions={
  <div className="flex items-center gap-3">
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