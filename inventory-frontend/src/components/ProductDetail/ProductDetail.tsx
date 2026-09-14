import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useInventory } from "../../context/InventoryContext";
import { useModal } from "../../context/ModalContext";
import { ProductService } from "../../services/productService";
import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";
import DetailImageCard from "../UI/Detail/DetailImageCard";
import DetailCard from "../UI/Detail/DetailCard";
import StatCard from "../UI/Detail/StatCard";
import DetailActions from "../UI/Detail/DetailActions";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products, fetchProducts } = useInventory();
  const { openEditProduct } = useModal();

  const [product, setProduct] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const existingProduct = products.find(
      (p) => p.id === Number(id)
    );

    if (existingProduct) {
      setProduct(existingProduct);
      return;
    }

    const fetchProduct = async () => {
      try {
        const res = await api.get(
          `/wp/v2/product/${id}`
        );

        setProduct(res.data);
      } catch (err) {
        console.error("Failed to load product:", err);
        setProduct(null);
      }
    };

    fetchProduct();
  }, [id, products]);

  if (!product) {
    return <div>Loading product...</div>;
  }

  const handleDeleteProduct = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await ProductService.delete(product.id);

      await fetchProducts();

      navigate("/products");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditProduct = () => {
    openEditProduct(product);
  };

  return (
    <PageContainer>

      <PageHeader title="Product Details">
        <Button
          variant="danger"
          onClick={handleDeleteProduct}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Product"}
        </Button>
      </PageHeader>

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-[35%_65%]
          gap-6
          p-6
        "
      >

        <DetailImageCard
          image={product.image}
        />

        <DetailCard
          product={product}
        />

      </div>

      <div
        className="
          grid
          grid-cols-5
          gap-4
          mx-6
          p-5
          border
          border-gray-200
          rounded-xl
          bg-white
        "
      >

        <StatCard
          label="Shelf"
          value={product.shelf?.[0]?.name}
        />

        <StatCard
          label="Status"
          value={product.inventory_status}
          type="status"
        />

        <StatCard
          label="Tested"
          value={product.test_status ? "Yes" : "No"}
        />

        <StatCard
          label="Test Date"
          value={product.test_date}
        />

        <StatCard
          label="Stock Level"
          value={product.quantity}
          type="stock"
        />

      </div>

      <div className="mx-6 mt-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">
            Notes
          </h3>

          <div className="mt-3">
            {product.notes ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {product.notes}
              </p>
            ) : (
              <p className="text-sm italic text-gray-400">
                No notes added.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <DetailActions
          onAdd={() => {
            console.log("Add new product");
          }}
          onEdit={handleEditProduct}
        />
      </div>

    </PageContainer>
  );
};

export default ProductDetail;