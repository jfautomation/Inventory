import type { ReactNode } from "react";
import DataTable from "../UI/DataTable/DataTable";
import { productListingColumns } from "./productListingColumns";
import { useInventory } from "../../context/InventoryContext";
import { useModal } from "../../context/ModalContext";
import { ProductListingService } from "../../services/productListingService";
import type { ProductListing } from "../../types";

type ProductListingTableProps = {
  listings: ProductListing[];
  tableHeader?: string;
  tableHeaderIcon?: ReactNode;
  toolbar?: ReactNode;
};

const ProductListingTable = ({
  listings,
  tableHeader,
  tableHeaderIcon,
  toolbar,
}: ProductListingTableProps) => {
  const {
    parts,
    brands,
    categories,
    conditions,
    fetchProductListings,
  } = useInventory();

  const { openEditListing } = useModal();

  const handleDelete = async (listing: ProductListing) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listing.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await ProductListingService.delete(listing.id);
      await fetchProductListings();
    } catch (error: any) {
      console.error("Failed to delete Product Listing:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to delete this listing. It may have serialized products associated with it.";

      window.alert(message);
    }
  };

  return (
    <DataTable
      columns={productListingColumns(
        parts,
        brands,
        categories,
        conditions,
        openEditListing,
        handleDelete
      )}
      data={listings}
      getRowKey={(listing) => listing.id}
      toolbar={toolbar}
      tableHeader={tableHeader}
      tableHeaderIcon={tableHeaderIcon}
    />
  );
};

export default ProductListingTable;
