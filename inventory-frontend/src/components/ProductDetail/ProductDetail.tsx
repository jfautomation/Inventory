import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useInventory } from "../../context/InventoryContext";

const ProductDetail = () => {
  const { id } = useParams();

  const {
    products,
  } = useInventory();


  const [product, setProduct] = useState<any>(null);


  useEffect(() => {

    if (!id) return;


    // =========================
    // CHECK GLOBAL CACHE FIRST
    // =========================
    const existingProduct = products.find(
      (p) => p.id === Number(id)
    );


    if (existingProduct) {

      console.log(
        "Loaded product from context:",
        existingProduct
      );

      setProduct(existingProduct);
      return;
    }


    // =========================
    // FALLBACK API FETCH
    // =========================
    const fetchProduct = async () => {

      try {

        console.log(
          "Fetching product from API..."
        );

        const res = await api.get(
          `/wp/v2/product/${id}`
        );

        setProduct(res.data);

      } catch (err) {

        console.error(
          "Failed loading product:",
          err
        );

      }

    };


    fetchProduct();


  }, [
    id,
    products,
  ]);



  if (!product) {
    return <div>Loading product...</div>;
  }

  console.log(product);

  return (
    <div style={{ padding: 24 }}>

      <h1>{product.title}</h1>

      <hr />

      <div
        style={{
          display: "flex",
          gap: 30,
          alignItems: "flex-start",
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        {/* IMAGE */}

        <div>
          {product.image && (
            <img
              src={product.image}
              alt={product.title}
              style={{
                width: 350,
                border: "1px solid #ddd",
              }}
            />
          )}
        </div>

        {/* INFO */}

        <div style={{ flex: 1 }}>

          <p><strong>Brand:</strong> {product.brand[0]?.name || "-"}</p>

          <p><strong>Category:</strong> {product.inventory_category[0]?.name || "-"}</p>

          <p><strong>Shelf:</strong> {product.shelf[0]?.name || "-"}</p>

          <p><strong>Condition:</strong> {product.condition[0]?.name || "-"}</p>

          <p><strong>Status:</strong> {product.inventory_status}</p>

          <p><strong>Quantity:</strong> {product.quantity}</p>

          <p><strong>Serial Number:</strong> {product.serial_number}</p>

          <p><strong>Work Order:</strong> {product.work_order}</p>

          <p><strong>Test Status:</strong> {product.test_status ? "Passed" : "Not Tested"}</p>

          <p><strong>Test Date:</strong> {product.test_date || "-"}</p>

          <p><strong>List Price:</strong> ${product.list_price}</p>

        </div>

      </div>

      <hr />

      <h3>Notes</h3>

      <p>{product.notes || "No notes."}</p>

    </div>
  );
};


export default ProductDetail;