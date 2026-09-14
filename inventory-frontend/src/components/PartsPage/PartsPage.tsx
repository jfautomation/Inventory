import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";
import InventoryFilters from "../ProductsPage/Inventory/InventoryFilters";
import DataTable from "../UI/DataTable/DataTable";
import { partColumns } from "./partColumns";
import { TaxonomyService } from "../../services/taxonomyService";
import { Part } from "../../types";
import { filterParts } from "./filterParts";
import { exportPartsCSV } from "../../utils/exportPartsCSV";

const PartsPage = () => {
  const navigate = useNavigate();

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

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <PageHeader title="Parts Inventory">

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

      </PageHeader>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="p-6">

        {/* ===================================================
            FILTERS
        =================================================== */}

        <div className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
          shadow-sm
        ">
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
        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="
          mt-6
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-sm
          overflow-hidden
        ">

          {/* TABLE HEADER */}

          <div className="
            px-5
            py-4
            border-b
            border-gray-200
          ">

            <div className="flex items-center justify-between">

              <div>
                <h3 className="
                  text-lg
                  font-semibold
                  text-gray-900
                ">
                  Parts Inventory
                </h3>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Manage and review your parts library.
                </p>
              </div>

              <div className="
  text-sm
  text-gray-500
">
                {filteredParts.length}{" "}
                {filteredParts.length === 1 ? "part" : "parts"}
              </div>

            </div>

          </div>


          {/* TABLE */}

          <div className="overflow-x-auto">

            <DataTable
              columns={partColumns(
                brands,
                categories,
                openEditPart,
                handleDeletePart
              )}
              data={filteredParts}
              getRowKey={(part) => part.id}
              onRowClick={(part) =>
                navigate(`/part/${part.id}`)
              }
            />

          </div>

        </div>

      </div>

    </PageContainer>
  );
};

export default PartsPage;

