import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import ProductForm from "../ProductForm/ProductForm";

const ProductsPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [brands, setBrands] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [shelves, setShelves] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(false);

  // =========================
  // PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const res = await api.get("/wp/v2/product");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================
  // TAXONOMIES
  // =========================
  const fetchTaxonomies = async () => {
    try {
      setLoadingTaxonomies(true);

      const [
        brandsRes,
        conditionsRes,
        shelvesRes,
        categoriesRes,
        seriesRes,
      ] = await Promise.all([
        api.get("/wp/v2/brand"),
        api.get("/wp/v2/condition"),
        api.get("/wp/v2/shelf"),
        api.get("/wp/v2/inventory_category"),
        api.get("/wp/v2/series"),
      ]);

      setBrands(brandsRes.data || []);
      setConditions(conditionsRes.data || []);
      setShelves(shelvesRes.data || []);
      setCategories(categoriesRes.data || []);
      setSeries(seriesRes.data || []);

      console.log("Taxonomies loaded:", {
        brands: brandsRes.data,
        conditions: conditionsRes.data,
        shelves: shelvesRes.data,
        categories: categoriesRes.data,
        series: seriesRes.data,
      });
    } catch (err) {
      console.error("Failed to load taxonomies:", err);
    } finally {
      setLoadingTaxonomies(false);
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchProducts();
    fetchTaxonomies();
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <div>
      <h1>Products</h1>

      {(loadingProducts || loadingTaxonomies) && (
        <p>Loading...</p>
      )}

      {/* FORM */}
      <div style={{ marginBottom: 20 }}>
        <ProductForm
          brands={brands}
          shelves={shelves}
          conditions={conditions}
          categories={categories}
          series={series}
          editingProduct={null}
          onCreated={() => fetchProducts()}
        />
      </div>

      {/* LIST */}
      <div style={{ display: "grid", gap: 10 }}>
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/product/${p.id}`)}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              cursor: "pointer",
            }}
          >
            <div>
              <strong>{p.title}</strong>
            </div>

            {p.serial_number && (
              <div>Serial: {p.serial_number}</div>
            )}

            {p.work_order && (
              <div>WO: {p.work_order}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;