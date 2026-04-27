import React from "react";
import ProductForm from "./ProductForm/ProductForm";
import { useInventory } from "../hooks/useInventory";

// -----------------------
// Types
// -----------------------
interface Product {
  id: number;
  title: { rendered: string };
  brand: number[];
  part: number[];
  shelf: number[];
  series: number[];
  serial_number?: string;
}

// safe fallback for BOTH environments
const wpData = (window as any)?.wpData;

// IMPORTANT: type the fallback properly
const initialProducts: Product[] = wpData?.products || [];

const Inventory: React.FC = () => {
  const { products, brands, parts, shelves, series, setProducts } =
    useInventory(initialProducts);

  console.log("PRODUCTS:", products);

  return (
    <div>
      <h1>Inventory testing!</h1>

     <ProductForm
  brands={brands}
  onCreated={(newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  }}
/>

      {products.map((product) => (
        <div key={product.id}>
           <strong>{product.title.rendered}</strong>
           <div>Serial: {product.serial_number || "-"}</div>
        </div>
      ))}
    </div>
  );
};

export default Inventory;



