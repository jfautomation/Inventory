import React, { useState, useEffect } from "react";
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
            Title: {product.title || "-"}
          </div>
          <div>Serial: {product.serial_number || "-"}</div>
          <div>WO: {product.work_order || "-"}</div>

          <div>
            Brand:{" "}
            {product.brand?.length
              ? product.brand.map((b) => b.name).join(", ")
              : "-"}
          </div>


          {/* PART (THIS WAS MISSING) */}
          <div>
            Part:{" "}
            {product.part?.length
              ? product.part.map((p) => p.name).join(", ")
              : "-"}
          </div>

          {/* CATEGORY (THIS WAS MISSING) */}
          <div>
            Category:{" "}
            {product.inventory_category?.length
              ? product.inventory_category.map((c) => c.name).join(", ")
              : "-"}
          </div>

          {/* SHELF (OPTIONAL BUT YOU SAID YOU WANT IT LATER) */}
          <div>
            Shelf:{" "}
            {product.shelf?.length
              ? product.shelf.map((s) => s.name).join(", ")
              : "-"}
          </div>

          {/* CONDITION */}
          <div>
            Condition:{" "}
            {product.condition?.length
              ? product.condition.map((c) => c.name).join(", ")
              : "-"}
          </div>

          <div>
            Series:{" "}
            {product.series?.length
              ? product.series.map((s) => s.name).join(", ")
              : "-"}
          </div>

          <div>Tested: {product.test_status ? "Yes" : "No"}</div>
          {product.test_status && product.test_date && (
            <div>
              Tested Date: {product.test_date}
            </div>
          )}

          <div>
            Status: {product.inventory_status || "publish"}
          </div>

          <div>
            Inventory: {product.quantity ?? 0}
          </div>

          <button onClick={() => setEditingProduct(product)}>
            Edit
          </button>

          <button onClick={() => handleDelete(product.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default Inventory;



