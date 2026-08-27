import ProductForm from "../ProductForm/ProductForm";
import PartForm from "../PartForm/PartForm";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";

const GlobalModals = () => {
  const {
    isProductOpen,
    closeProduct,
    editingProduct,

    isPartOpen,
    closePart,
    editingPart,
  } = useModal();

  const {
    brands,
    shelves,
    conditions,
    categories,
    series,
    fetchProducts,
    fetchParts,
  } = useInventory();

  // =====================================
  // AFTER PRODUCT CREATE / UPDATE
  // =====================================

  const handleProductRefresh = async () => {
    console.log("Refreshing products only...");
    await fetchProducts();
  };

  // =====================================
  // AFTER PART CREATE / UPDATE
  // =====================================

  const handlePartRefresh = async () => {
    console.log("Refreshing parts only...");
    await fetchParts();
  };

  return (
    <>
      {/* =====================================
          PRODUCT MODAL
      ===================================== */}

      {isProductOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <ProductForm
              brands={brands}
              shelves={shelves}
              conditions={conditions}
              categories={categories}
              series={series}
              editingProduct={editingProduct}

              onCreated={async () => {
                await handleProductRefresh();
                closeProduct();
              }}

              onUpdated={async () => {
                await handleProductRefresh();
                closeProduct();
              }}

              onClose={closeProduct}
            />

            <button onClick={closeProduct}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* =====================================
          PART MODAL
      ===================================== */}

      {isPartOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <PartForm
              brands={brands}
              categories={categories}
              editingPart={editingPart}

              onCreated={async () => {
                await handlePartRefresh();
                closePart();
              }}

              onUpdated={async () => {
                await handlePartRefresh();
                closePart();
              }}

              onClose={closePart}
            />

            <button onClick={closePart}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalModals;


// ===============================
// STYLES
// ===============================

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  padding: 20,
  width: 700,
  borderRadius: 8,
};