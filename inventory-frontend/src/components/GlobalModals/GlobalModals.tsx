import ProductForm from "../ProductForm/ProductForm";
import { useModal } from "../../context/ModalContext";

const GlobalModals = () => {
  const { isProductOpen, closeProduct } = useModal();

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
          brands={[]}
          shelves={[]}
          conditions={[]}
          categories={[]}
          editingProduct={null}
          onCreated={closeProduct}
        />

        <button onClick={closeProduct}>Close</button>
      </div>
    </div>
  );
};

export default GlobalModals;