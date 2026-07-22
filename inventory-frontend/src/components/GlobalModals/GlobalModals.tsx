import { useEffect } from "react";
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

    refreshInventory,
    refreshTaxonomies,
  } = useInventory();


  // =====================================
  // LOAD TAXONOMIES WHEN APP STARTS
  // =====================================
  useEffect(() => {
    refreshTaxonomies();
  }, [refreshTaxonomies]);


  // =====================================
  // AFTER CREATE / UPDATE
  // =====================================
  const handleRefresh = async () => {
    console.log("Refreshing global inventory...");
    
    await Promise.all([
      refreshInventory(),
      refreshTaxonomies(),
    ]);
  };


  return (
    <>

      {/* ===============================
          PRODUCT MODAL
      =============================== */}
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
                await handleRefresh();
                closeProduct();
              }}

              onUpdated={async () => {
                await handleRefresh();
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



      {/* ===============================
          PART MODAL
      =============================== */}
      {isPartOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>

            <PartForm
              brands={brands}
              categories={categories}

              editingPart={editingPart}

              onCreated={async () => {
                await handleRefresh();
                closePart();
              }}

              onUpdated={async () => {
                await handleRefresh();
                closePart();
              }}

              onClose={closePart}

              clearEditing={() => {}}
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