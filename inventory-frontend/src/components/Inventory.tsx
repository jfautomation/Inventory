import React, { useState } from "react";
import ProductForm from "./ProductForm/ProductForm";
import { useInventory } from "../hooks/useInventory";
import { Product } from "../types";
import { normalizeProduct } from "../utils/normalizeProduct";

// safe fallback for BOTH environments

const wpData = (window as any)?.wpData;

const initialProducts: Product[] =
  (wpData?.products || []).map(normalizeProduct);

const Inventory: React.FC = () => {
  const { products, brands, parts, shelves, series, setProducts } =
    useInventory(initialProducts);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  console.log("PRODUCTS:", products);

  return (
    <div>
      <h1>Inventory testing!</h1>

      <ProductForm
        brands={brands}
        editingProduct={editingProduct}
        clearEditing={() => setEditingProduct(null)}

        onCreated={(newProduct) => {
          // ✅ normalize BEFORE storing
          setProducts((prev) => [
            normalizeProduct(newProduct),
            ...prev,
          ]);
        }}

        onUpdated={(updatedProduct) => {
          // ✅ replace updated item properly
          const normalized = normalizeProduct(updatedProduct);

          setProducts((prev) =>
            prev.map((p) => (p.id === normalized.id ? normalized : p))
          );
        }}
      />

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          {/* ✅ FIXED: title is now a string */}
          <span>{product.title || "-"}</span>
          <div>Serial: {product.serial_number || "-"}</div>
          <div>WO: {product.work_order || "-"}</div>
          <div>Tested: {product.test_status ? "Yes" : "No"}</div>

          <button onClick={() => setEditingProduct(product)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
};

export default Inventory;



