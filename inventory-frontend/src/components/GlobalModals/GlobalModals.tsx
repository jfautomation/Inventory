
import { useEffect } from "react";
import InventoryForm from "../InventoryForm/InventoryForm";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";

const GlobalModals = () => {
  const {
    isProductOpen,
    closeProduct,
    editingProduct,
    initialListingId,
    isPartOpen,
    closePart,
    editingPart,
    isListingOpen,
    closeListing,
    editingListing,
  } = useModal();

  const {
    brands,
    shelves,
    conditions,
    categories,
    series,
    fetchProducts,
    fetchParts,
    fetchProductListings,
  } = useInventory();

  const modalOpen = isProductOpen || isPartOpen || isListingOpen;

  const entity = isProductOpen
    ? "product"
    : isPartOpen
      ? "part"
      : "listing";

  const closeModal = isProductOpen
    ? closeProduct
    : isPartOpen
      ? closePart
      : closeListing;

  const handleRefresh = async () => {
    if (isProductOpen) {
      await fetchProducts();
    } else if (isPartOpen) {
      await fetchParts();
    } else if (isListingOpen) {
      await fetchProductListings();
    }
  };

  useEffect(() => {
    if (!modalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [modalOpen]);

  if (!modalOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalContentStyle}>
          <InventoryForm
            entity={entity}
            brands={brands}
            shelves={shelves}
            conditions={conditions}
            categories={categories}
            series={series}
            editingProduct={isProductOpen ? editingProduct : null}
            editingPart={isPartOpen ? editingPart : null}
            editingListing={isListingOpen ? editingListing : null}
            initialListingId={isProductOpen ? initialListingId : null}
            onCreated={async () => {
              await handleRefresh();
              closeModal();
            }}
            onUpdated={async () => {
              await handleRefresh();
              closeModal();
            }}
          />
        </div>

        <div style={modalFooterStyle}>
          <button
            type="button"
            onClick={closeModal}
            style={footerButtonStyle}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalModals;

// =====================================
// STYLES
// =====================================

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "860px",
  height: "calc(100vh - 48px)",
  maxHeight: "calc(100vh - 48px)",
  background: "#fff",
  borderRadius: "14px",
  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.18)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const modalContentStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: "20px 24px",
};

const modalFooterStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "flex",
  justifyContent: "flex-end",
  padding: "12px 24px",
  borderTop: "1px solid #e5e7eb",
  background: "#f9fafb",
};

const footerButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};
