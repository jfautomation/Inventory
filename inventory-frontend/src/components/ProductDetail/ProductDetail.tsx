import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { useInventory } from "../../context/InventoryContext";
import { useModal } from "../../context/ModalContext";
import { ProductService } from "../../services/productService";
import { api } from "../../api/client";

import InventoryDetail from "../UI/Detail/InventoryDetail";
import DetailCard from "../UI/Detail/DetailCard";
import StatCard from "../UI/Detail/StatCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products, fetchProducts } = useInventory();
  const { openEditProduct } = useModal();

  const [product, setProduct] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // LOAD PRODUCT
  // =========================================================

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
        console.error(
          "Failed to load product:",
          err
        );

        setProduct(null);
      }
    };

    fetchProduct();
  }, [id, products]);


  // =========================================================
  // LOADING
  // =========================================================

  if (!product) {
    return <div>Loading product...</div>;
  }


  // =========================================================
  // DELETE
  // =========================================================

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
      console.error(
        "Delete failed:",
        err
      );

      alert(
        "Failed to delete product."
      );

    } finally {
      setDeleting(false);
    }
  };


  // =========================================================
  // EDIT
  // =========================================================

  const handleEditProduct = () => {
    openEditProduct(product);
  };


  // =========================================================
  // UI
  // =========================================================



  return (
    <InventoryDetail
      title="Product Details"
      deleteLabel="Delete Product"
      deleting={deleting}
      addLabel="Add New Product"
      editLabel="Edit Product Details"
      statsColumns={5}
      image={product.image}
      additionalImages={
        product.additional_image_urls || []
      }
      imageAlt={product.title}
      onDelete={handleDeleteProduct}
      onEdit={handleEditProduct}
      onAdd={() => {
        console.log("Add new product");
      }}

      stats={
        <>
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
            value={
              product.test_status
                ? "Yes"
                : "No"
            }
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
        </>
      }
    >

      <DetailCard
        product={product}
      />

    </InventoryDetail>
  );
};

export default ProductDetail;









