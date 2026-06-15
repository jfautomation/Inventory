import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useModal } from "../../context/ModalContext";
import ProductCard from "../ProductCard/ProductCard";
import { ProductService } from "../../services/productService";

const ProductsPage = () => {
  const navigate = useNavigate();

  const { openProduct, openEditProduct } = useModal();

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

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
  // DELETE
  // =========================
  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.delete(id);

      setProducts((prev) =>
        prev.filter((p) => p.id !== id)
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // UI
  // =========================
  return (
    <div>
      <h1>Products</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={openProduct}>
          Add Product
        </button>
      </div>

      {loadingProducts && <p>Loading...</p>}

      <div style={{ display: "grid", gap: 10 }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onView={(id) =>
              navigate(`/product/${id}`)
            }
            onEdit={(product) =>
              openEditProduct(product)
            }
            onDelete={(id) =>
              handleDeleteProduct(id)
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;