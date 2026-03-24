import React, { useEffect, useState } from "react";
import axios from "axios";

// -----------------------
// Types for WordPress data
// -----------------------
interface Term {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: { rendered: string };
  brand: number[];
  part: number[];
  shelf: number[];
  series: number[];
  serial_number?: string;
  condition?: string;
  list_price?: string;
  notes?: string;
  test_status?: boolean;
  test_date?: string;
}

// -----------------------
// Props & Component
// -----------------------
const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Term[]>([]);
  const [parts, setParts] = useState<Term[]>([]);
  const [shelves, setShelves] = useState<Term[]>([]);
  const [series, setSeries] = useState<Term[]>([]);

  // -----------------------
  // Fetch data from WP REST API
  // -----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = "http://jf-automation-inc-inventory.local/wp-json/wp/v2";

        const [productsRes, brandsRes, partsRes, shelvesRes, seriesRes] =
          await Promise.all([
            axios.get<Product[]>(`${baseUrl}/product`),
            axios.get<Term[]>(`${baseUrl}/brand`),
            axios.get<Term[]>(`${baseUrl}/part`),
            axios.get<Term[]>(`${baseUrl}/shelf`),
            axios.get<Term[]>(`${baseUrl}/series`),
          ]);

        setProducts(productsRes.data);
        setBrands(brandsRes.data);
        setParts(partsRes.data);
        setShelves(shelvesRes.data);
        setSeries(seriesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // -----------------------
  // Helper to get term names by ID
  // -----------------------
  const getTermNames = (ids: number[], terms: Term[]) =>
    ids.map((id) => terms.find((t) => t.id === id)?.name || "").join(", ");

  // -----------------------
  // Render
  // -----------------------
  return (
    <div>
      <h1>Inventory</h1>
      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2>{product.title.rendered}</h2>
          <p>
            <strong>Brand:</strong>{" "}
            {getTermNames(product.brand, brands)}
          </p>
          <p>
            <strong>Part:</strong> {getTermNames(product.part, parts)}
          </p>
          <p>
            <strong>Shelf:</strong> {getTermNames(product.shelf, shelves)}
          </p>
          <p>
            <strong>Series:</strong> {getTermNames(product.series, series)}
          </p>
          <p>
            <strong>Serial Number:</strong> {product.serial_number || "-"}
          </p>
          <p>
            <strong>Condition:</strong> {product.condition || "-"}
          </p>
          <p>
            <strong>List Price:</strong> {product.list_price || "-"}
          </p>
          <p>
            <strong>Notes:</strong> {product.notes || "-"}
          </p>
          <p>
            <strong>Test Status:</strong>{" "}
            {product.test_status ? "Passed" : "Not Tested"}
          </p>
          <p>
            <strong>Test Date:</strong> {product.test_date || "-"}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Inventory;