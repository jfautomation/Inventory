import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm/ProductForm";
import PartForm from "./PartForm/PartForm";
import { useInventory } from "../hooks/useInventory";
import { Product } from "../types";
import { normalizeProduct } from "../utils/normalizeProduct";
import { api } from "../api/client";
import { ProductService } from "../services/productService";

const wpData =
  typeof window !== "undefined" ? (window as any).wpData : null;

const initialProducts: Product[] = (wpData?.products || []).map(normalizeProduct);

const Inventory: React.FC = () => {
  const {
    products,
    brands,
    shelves,
    conditions,
    categories,
    setProducts,
  } = useInventory(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const navigate = useNavigate();

  // 🔍 Debug fetch (safe to remove later)
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

  // ----------------------------
  // DELETE
  // ----------------------------
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await ProductService.delete(id);

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("DELETE FAILED:", err);
      alert("Delete failed");
    }
  };


  console.log("PRODUCT RAW:", products[0]);

  return (
    <div>
      <h1>Inventory testing!</h1>
      <hr />
      <PartForm brands={brands} categories={categories} />
      <hr />
      <ProductForm
        brands={brands}
        shelves={shelves}
        editingProduct={editingProduct}
        conditions={conditions}
        categories={categories}
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

      {/* ---------------- PRODUCTS LIST ---------------- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              marginBottom: 10,
              cursor: "pointer",
              borderRadius: 6,
            }}
          >
            {/* IMAGE */}
            {product.image && (
              <div style={{ marginBottom: 10 }}>
                <img
                  src={product.image}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}

            {/* CORE */}
            <div style={{ fontWeight: 600 }}>
              Title: {product.title || "-"}
            </div>

            <div>Serial: {product.serial_number || "-"}</div>
            <div>WO: {product.work_order || "-"}</div>

            {/* BRAND */}
            <div>
              <strong>Brand:</strong>{" "}
              {product.brand?.length
                ? product.brand.map((b) => b.name).join(", ")
                : "-"}
            </div>

            {/* PART */}
            <div>
              <strong>Part:</strong>{" "}
              {product.part?.length
                ? product.part.map((p) => p.name).join(", ")
                : "-"}
            </div>

            {/* CATEGORY */}
            <div>
              <strong>Category:</strong>{" "}
              {product.inventory_category?.length
                ? product.inventory_category.map((c) => c.name).join(", ")
                : "-"}
            </div>

            {/* SHELF */}
            <div>
              <strong>Shelf:</strong>{" "}
              {product.shelf?.length
                ? product.shelf.map((s) => s.name).join(", ")
                : "-"}
            </div>

            {/* CONDITION */}
            <div>
              <strong>Condition:</strong>{" "}
              {product.condition?.length
                ? product.condition.map((c) => c.name).join(", ")
                : "-"}
            </div>

            {/* NOTES */}
            <div style={{ marginTop: 6 }}>
              <strong>Notes:</strong>{" "}
              {product.notes || "-"}
            </div>

            {/* SERIES */}
            <div>
              <strong>Series:</strong>{" "}
              {product.series?.length
                ? product.series.map((s) => s.name).join(", ")
                : "-"}
            </div>

            {/* STATUS */}
            <div style={{ marginTop: 6, fontSize: 13 }}>
              <div>Tested: {product.test_status ? "Yes" : "No"}</div>

              {product.test_status && product.test_date && (
                <div>Tested Date: {product.test_date}</div>
              )}

              <div>Status: {product.inventory_status || "publish"}</div>
              <div>Inventory: {product.quantity ?? 0}</div>
            </div>

            {/* ACTIONS */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingProduct(product);
                }}
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(product.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;



