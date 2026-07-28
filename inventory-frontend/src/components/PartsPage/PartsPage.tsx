import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";
import InventoryFilters from "../ProductsPage/Inventory/InventoryFilters";
import DataTable from "../UI/DataTable/DataTable";
import { partColumns } from "./partColumns";

const PartsPage = () => {
  const navigate = useNavigate();

  const { openPart } = useModal();

  const {
    parts,
    brands,
    categories,
    refreshInventory,
  } = useInventory();



  // =========================
  // DELETE (if you add later)
  // =========================
  const handleDeletePart = async (id: number) => {
    try {
      // TODO: replace with PartService when you have it
      // await PartService.delete(id);

      await refreshInventory();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <PageContainer>

      <PageHeader title="Parts Inventory">

        <Button onClick={openPart}>
          Add Part
        </Button>

        <Button
          variant="secondary"
        >
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
            columns={partColumns(brands, categories)}
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