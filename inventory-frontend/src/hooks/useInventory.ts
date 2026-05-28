import { useEffect, useState } from "react";
import { Product, Term } from "../types";
import { ProductService } from "../services/productService";
import { normalizeProduct } from "../utils/normalizeProduct";
import { api } from "../api/client";

export const useInventory = (initialProducts: Product[] = []) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [brands, setBrands] = useState<Term[]>([]);
  const [parts, setParts] = useState<Term[]>([]);
  const [shelves, setShelves] = useState<Term[]>([]);
  const [series, setSeries] = useState<Term[]>([]);
  const [conditions, setConditions] = useState<Term[]>([]);
  const [categories, setCategories] = useState<Term[]>([]); // ✅ ADDED

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsPromise = ProductService.getAll();

        const brandsPromise = api.get("/wp/v2/brand");

        // ❌ REMOVE raw WP endpoint
        // const partsPromise = api.get("/wp/v2/part");

        // ✅ KEEP ONLY IF YOU TRULY NEED GLOBAL PART LIST (you usually don’t)
        const partsPromise = Promise.resolve({ data: [] });

        const shelvesPromise = api.get("/wp/v2/shelf");
        const seriesPromise = api.get("/wp/v2/series");
        const conditionsPromise = api.get("/wp/v2/condition");

        // ❌ replace raw WP taxonomy endpoint
        // const categoriesPromise = api.get("/wp/v2/inventory_category");

        // ✅ optional: keep if you use WP categories directly, otherwise replace later
        const categoriesPromise = api.get("/wp/v2/inventory_category");

        const [
          productsRes,
          brandsRes,
          partsRes,
          shelvesRes,
          seriesRes,
          conditionsRes,
          categoriesRes, // ✅ ADDED
        ] = await Promise.all([
          productsPromise,
          brandsPromise,
          partsPromise,
          shelvesPromise,
          seriesPromise,
          conditionsPromise,
          categoriesPromise, // ✅ ADDED
        ]);

        console.log("PRODUCTS RAW:", productsRes);
        console.log("BRANDS RAW:", brandsRes.data);
        console.log("PARTS RAW:", partsRes.data);
        console.log("SHELVES RAW:", shelvesRes.data);
        console.log("SERIES RAW:", seriesRes.data);
        console.log("CONDITIONS RAW:", conditionsRes.data);
        console.log("CATEGORIES RAW:", categoriesRes.data); // ✅ ADDED

        setProducts(productsRes.map(normalizeProduct));
        setBrands(brandsRes.data);
        setParts(partsRes.data);
        setShelves(shelvesRes.data);
        setSeries(seriesRes.data);
        setConditions(conditionsRes.data);
        setCategories(categoriesRes.data); // ✅ ADDED

      } catch (err) {
        console.error("Inventory fetch failed:", err);
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
    conditions,
    categories, // ✅ ADDED
    setProducts,
  };
};





