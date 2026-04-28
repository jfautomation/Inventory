import { useEffect, useState } from "react";
import axios from "axios";
import { Term, Product } from "../types";
import { normalizeProduct } from "../utils/normalizeProduct";


const baseUrl =
  "http://jf-auto-inventory-clone-2.local/wp-json/wp/v2";

// -----------------------
// Hook
// -----------------------
export const useInventory = (initialProducts: Product[] = []) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [brands, setBrands] = useState<Term[]>([]);
  const [parts, setParts] = useState<Term[]>([]);
  const [shelves, setShelves] = useState<Term[]>([]);
  const [series, setSeries] = useState<Term[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, partsRes, shelvesRes, seriesRes, productsRes] =
          await Promise.all([
            axios.get(`${baseUrl}/brand`),
            axios.get(`${baseUrl}/part`),
            axios.get(`${baseUrl}/shelf`),
            axios.get(`${baseUrl}/series`),
            axios.get(`${baseUrl}/product`),
          ]);

        setBrands(brandsRes.data);
        setParts(partsRes.data);
        setShelves(shelvesRes.data);
        setSeries(seriesRes.data);

        setProducts(productsRes.data.map(normalizeProduct));
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return {
    products,
    brands,
    parts,
    shelves,
    series,
    setProducts,
  };
};





