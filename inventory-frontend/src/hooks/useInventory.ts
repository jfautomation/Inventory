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

  useEffect(() => {
  const fetchData = async () => {
    try {
      const productsPromise = ProductService.getAll();
      const brandsPromise = api.get("/wp/v2/brand");
      const partsPromise = api.get("/wp/v2/part");
      const shelvesPromise = api.get("/wp/v2/shelf");
      const seriesPromise = api.get("/wp/v2/series");

      const [
        productsRes,
        brandsRes,
        partsRes,
        shelvesRes,
        seriesRes,
      ] = await Promise.all([
        productsPromise,
        brandsPromise,
        partsPromise,
        shelvesPromise,
        seriesPromise,
      ]);

      console.log("PRODUCTS RAW:", productsRes);
      console.log("BRANDS RAW:", brandsRes.data);
      console.log("PARTS RAW:", partsRes.data);
      console.log("SHELVES RAW:", shelvesRes.data);
      console.log("SERIES RAW:", seriesRes.data);

      setProducts(productsRes.map(normalizeProduct));
      setBrands(brandsRes.data);
      setParts(partsRes.data);
      setShelves(shelvesRes.data);
      setSeries(seriesRes.data);

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
    setProducts,
  };
};





