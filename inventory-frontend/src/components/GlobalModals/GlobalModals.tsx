import { useEffect, useState } from "react";
import ProductForm from "../ProductForm/ProductForm";
import PartForm from "../PartForm/PartForm";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import { api } from "../../api/client";

const GlobalModals = () => {
  const {
    isProductOpen,
    closeProduct,
    editingProduct,

    isPartOpen,
    closePart,
    editingPart,
  } = useModal();

  // ✅ GLOBAL REFRESH (NEW SYSTEM)
  const { refreshInventory } = useInventory();

  // =========================
  // TAXONOMIES (shared)
  // =========================
  const [brands, setBrands] = useState<any[]>([]);
  const [shelves, setShelves] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);

  const loadTaxonomies = async () => {
    try {
      const [b, s, c, cat, ser] = await Promise.all([
        api.get("/wp/v2/brand"),
        api.get("/wp/v2/shelf"),
        api.get("/wp/v2/condition"),
        api.get("/wp/v2/inventory_category"),
        api.get("/wp/v2/series"),
      ]);

      setBrands(b.data || []);
      setShelves(s.data || []);
      setConditions(c.data || []);
      setCategories(cat.data || []);
      setSeries(ser.data || []);
    } catch (err) {
      console.error("Modal taxonomy load failed:", err);
    }
  };

  // =========================
  // LOAD TAXONOMIES ONLY WHEN NEEDED
  // =========================
  useEffect(() => {
    if (!isProductOpen && !isPartOpen) return;
    loadTaxonomies();
  }, [isProductOpen, isPartOpen]);

  // =========================
  // REFRESH AFTER SAVE
  // =========================
  const handleInventoryRefresh = async () => {
    console.log("REFRESHING INVENTORY");
    await refreshInventory();
  };

  // =========================
  // UI
  // =========================
  return (
    <>
      {/* =========================
          PRODUCT MODAL
      ========================= */}
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
                await handleInventoryRefresh();
                closeProduct();
              }}
              onUpdated={async () => {
                await handleInventoryRefresh();
                closeProduct();
              }}
              onClose={closeProduct}
            />

            <button onClick={closeProduct}>Close</button>
          </div>
        </div>
      )}

      {/* =========================
          PART MODAL
      ========================= */}
      {isPartOpen && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <PartForm
              brands={brands}
              categories={categories}
              editingPart={editingPart}
              onCreated={async () => {
                await handleInventoryRefresh();
                closePart();
              }}
              onUpdated={async () => {
                await handleInventoryRefresh();
                closePart();
              }}
              onClose={closePart}
              clearEditing={() => { }}
            />

            <button onClick={closePart}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalModals;

// optional shared styles
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