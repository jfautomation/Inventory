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
  } = useInventory();

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

  return (
    <PageContainer>

      <PageHeader title="Parts Inventory">

        <Button onClick={openPart}>
          Add Part
        </Button>

        <Button variant="secondary">
          Export
        </Button>

      </PageHeader>


      <div className="p-4">

        <InventoryFilters entityName="Parts" />


        <div className="mt-6">

          <h3 className="
            text-lg
            font-semibold
            mb-4
          ">
            Parts Inventory
          </h3>


          <DataTable
            columns={partColumns(
              brands,
              categories,
              openEditPart,
              handleDeletePart
            )}
            data={parts}
            getRowKey={(part) => part.id}
            onRowClick={(part) =>
              navigate(`/part/${part.id}`)
            }
          />

        </div>

      </div>

    </PageContainer>
  );
};

export default PartsPage;
