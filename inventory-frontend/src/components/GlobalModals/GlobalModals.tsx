import { useEffect, useState } from "react";
import ProductForm from "../ProductForm/ProductForm";
import { useModal } from "../../context/ModalContext";
import { api } from "../../api/client";

const GlobalModals = () => {
  const { isProductOpen, closeProduct } = useModal();

  const [brands, setBrands] = useState<any[]>([]);
  const [shelves, setShelves] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    if (!isProductOpen) return;

    const loadTaxonomies = async () => {
      try {
        const [
          b,
          s,
          c,
          cat,
          ser,
        ] = await Promise.all([
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

    loadTaxonomies();
  }, [isProductOpen]);

  if (!isProductOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ background: "#fff", padding: 20, width: 700 }}>
        <ProductForm
          brands={brands}
          shelves={shelves}
          conditions={conditions}
          categories={categories}
          series={series}
          editingProduct={null}
          onCreated={closeProduct}
        />

        <button onClick={closeProduct}>Close</button>
      </div>
    </div>
  );
};

export default GlobalModals;