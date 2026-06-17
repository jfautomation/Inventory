import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import { useInventory } from "../../context/InventoryContext";
import ProductCard from "../ProductCard/ProductCard";
import { ProductService } from "../../services/productService";

const ProductsPage = () => {
  const navigate = useNavigate();

  const { openProduct, openEditProduct } = useModal();

  // ✅ GLOBAL STATE (single source of truth)
  const {
    products,
    fetchProducts,
    refreshInventory,
  } = useInventory();

  // =========================
  // INIT LOAD
  // =========================
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // =========================
  // DELETE
  // =========================
  const handleDeleteProduct = async (id: number) => {
    try {
      await ProductService.delete(id);

      // ✅ refresh global state
      await refreshInventory();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

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