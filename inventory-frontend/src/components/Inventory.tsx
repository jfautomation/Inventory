import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, partsRes] = await Promise.all([
          api.get("/wp/v2/product"),
          api.get("/inventory/v1/parts"),
        ]);

        setProducts(productsRes.data || []);
        setParts(partsRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      }
    };

    fetchData();
  }, []);

  const recentProducts = products.slice(0, 5);
  const recentParts = parts.slice(0, 5);

  return (
    <div>
      <h1>Dashboard</h1>

      {/* ACTIONS */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/products")}>
          Add Product
        </button>

        <button onClick={() => navigate("/parts")}>
          Add Part
        </button>

        <button onClick={() => alert("Import coming soon")}>
          Import
        </button>

        <button onClick={() => alert("Export coming soon")}>
          Export
        </button>
      </div>

      {/* STATS */}
      <div style={{ marginBottom: 20 }}>
        <div>Total Products: {products.length}</div>
        <div>Total Parts: {parts.length}</div>
      </div>

      {/* RECENT PRODUCTS */}
      <div style={{ marginBottom: 30 }}>
        <h3>Recent Products</h3>

        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Serial</th>
              <th>Work Order</th>
            </tr>
          </thead>

          <tbody>
            {recentProducts.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{p.title}</td>
                <td>{p.serial_number || "-"}</td>
                <td>{p.work_order || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RECENT PARTS */}
      <div>
        <h3>Recent Parts</h3>

        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
            </tr>
          </thead>

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



