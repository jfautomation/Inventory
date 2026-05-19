import React, { useState, useEffect } from "react";
import ProductForm from "./ProductForm/ProductForm";
import { useInventory } from "../hooks/useInventory";
import { Product } from "../types";
import { normalizeProduct } from "../utils/normalizeProduct";
import { api } from "../api/client";
import { ProductService } from "../services/productService";

const wpData =
  typeof window !== "undefined" ? (window as any).wpData : null;

const initialProducts: Product[] = (wpData?.products || []).map(
  normalizeProduct
);

const Inventory: React.FC = () => {
  const { products, brands, setProducts } =
    useInventory(initialProducts);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ✅ CLEAN JWT TEST FETCH (no Basic Auth)
  useEffect(() => {
    const testFetch = async () => {
      try {
        const res = await api.get("/wp/v2/product");
        console.log("PRODUCTS LOADED:", res.data);
      } catch (err) {
        console.error("GET PRODUCTS FAILED:", err);
      }
    };

    testFetch();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await ProductService.delete(id);

      // update UI immediately (no refetch needed)
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("DELETE FAILED:", err);
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h1>Inventory testing!</h1>

      <ProductForm
        brands={brands}
        editingProduct={editingProduct}
        clearEditing={() => setEditingProduct(null)}
        onCreated={(newProduct) => {
          const normalized = normalizeProduct(newProduct);

          setProducts((prev) => [normalized, ...prev]);
        }}
        onUpdated={(updatedProduct) => {
          const normalized = normalizeProduct(updatedProduct);

          setProducts((prev) =>
            prev.map((p) => (p.id === normalized.id ? normalized : p))
          );
        }}
      />

      {/* PRODUCTS LIST */}
      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <div>
            <strong>{product.title || "-"}</strong>
          </div>

          <div>Serial: {product.serial_number || "-"}</div>
          <div>WO: {product.work_order || "-"}</div>

          <div>
            Brand:{" "}
            {product.brand?.length
              ? product.brand.map((b) => b.name).join(", ")
              : "-"}
          </div>

          <div>Tested: {product.test_status ? "Yes" : "No"}</div>

          <button onClick={() => setEditingProduct(product)}>
            Edit
          </button>

          <button onClick={() => handleDelete(product.id)}>
            Delete
          </button>

          <button onClick={() => setEditingProduct(product)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
};

export default Inventory;



