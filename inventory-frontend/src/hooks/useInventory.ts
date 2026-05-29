import { useEffect, useState } from "react";
import { Product, Term } from "../types";
import { ProductService } from "../services/productService";

export const useInventory = (initialProducts: Product[] = []) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [brands, setBrands] = useState<Term[]>([]);
  const [parts, setParts] = useState<Term[]>([]);
  const [shelves, setShelves] = useState<Term[]>([]);
  const [series, setSeries] = useState<Term[]>([]);
  const [conditions, setConditions] = useState<Term[]>([]);
  const [categories, setCategories] = useState<Term[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // =========================
        // PRODUCTS (ONLY SOURCE)
        // =========================
        const productsRes = await ProductService.getAll();
        setProducts(productsRes);

        // =========================
        // TAXONOMIES (WP REST OK)
        // =========================
        const [
          brandsRes,
          shelvesRes,
          seriesRes,
          conditionsRes,
          categoriesRes,
        ] = await Promise.all([
          fetch("/wp-json/wp/v2/brand").then((r) => r.json()),
          fetch("/wp-json/wp/v2/shelf").then((r) => r.json()),
          fetch("/wp-json/wp/v2/series").then((r) => r.json()),
          fetch("/wp-json/wp/v2/condition").then((r) => r.json()),
          fetch("/wp-json/wp/v2/inventory_category").then((r) => r.json()),
        ]);

        setBrands(brandsRes || []);
        setShelves(shelvesRes || []);
        setSeries(seriesRes || []);
        setConditions(conditionsRes || []);
        setCategories(categoriesRes || []);
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
    categories,
    setProducts,
  };
};




