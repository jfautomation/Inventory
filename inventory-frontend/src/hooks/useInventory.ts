import { useEffect, useState } from "react";
import axios from "axios";

// -----------------------
// Types
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
}

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
        const [brandsRes, partsRes, shelvesRes, seriesRes] =
          await Promise.all([
            axios.get(`${baseUrl}/brand`),
            axios.get(`${baseUrl}/part`),
            axios.get(`${baseUrl}/shelf`),
            axios.get(`${baseUrl}/series`),
          ]);

        setBrands(brandsRes.data);
        setParts(partsRes.data);
        setShelves(shelvesRes.data);
        setSeries(seriesRes.data);

        // only fetch products if no initial data exists
        if (!initialProducts.length) {
          const productsRes = await axios.get(`${baseUrl}/product`);
          setProducts(productsRes.data);
        }
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





