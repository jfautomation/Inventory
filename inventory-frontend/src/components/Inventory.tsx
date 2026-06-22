import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { useInventory } from "../context/InventoryContext";
import Login from "./Login/Login";
import { getToken } from "../api/client";
import { ProductService } from "../services/productService";
import ProductCard from "./ProductCard/ProductCard";

const Inventory: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { openProduct, openEditProduct, openPart } = useModal();

  // ✅ GLOBAL STATE (this replaces local state)
  const {
    products,
    parts,
    refreshInventory,
  } = useInventory();

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // =========================
  // INITIAL LOAD (GLOBAL)
  // =========================
  useEffect(() => {
    if (!isLoggedIn) return;

    refreshInventory();
  }, [isLoggedIn, refreshInventory]);


  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.delete(id);

      // 🔥 refresh global state
      await refreshInventory();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // =========================
  // LOGIN GATE
  // =========================
  if (!isLoggedIn) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  const recentProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const recentParts = [...parts]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  return (
    <div>
      <h1>Dashboard Testing if refreshing</h1>

      <div className="bg-red-500 text-white p-4">
        Tailwind working
      </div>

      {/* ACTIONS */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={openProduct}>Add Product</button>
        <button onClick={openPart}>Add Part</button>
        <button onClick={() => alert("Import coming soon")}>Import</button>
        <button onClick={() => alert("Export coming soon")}>Export</button>
      </div>

      {/* STATS */}
      <div style={{ marginBottom: 20 }}>
        <div>Total Products: {products.length}</div>
        <div>Total Parts: {parts.length}</div>
      </div>

      {/* RECENT PRODUCTS */}
      <div style={{ marginBottom: 30 }}>
        <h3>Recent Products</h3>

        <div style={{ display: "grid", gap: 10 }}>
          {recentProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onView={(id) => navigate(`/product/${id}`)}
              onEdit={(product) => openEditProduct(product)}
              onDelete={(id) => handleDeleteProduct(id)}
            />
          ))}
        </div>
      </div>

      {/* RECENT PARTS */}
      <div>
        <h3>Recent Parts</h3>

        <table border={1} cellPadding={6} width="100%">
          <tbody>
            {recentParts.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/part/${p.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{p.name}</td>
                <td>{p.category?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;