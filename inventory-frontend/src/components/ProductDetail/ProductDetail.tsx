import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useInventory } from "../../context/InventoryContext";
import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import Button from "../UI/Button/Button";
import DetailImageCard from "../UI/Detail/DetailImageCard"
import DetailCard from "../UI/Detail/DetailCard";
import StatCard from "../UI/Detail/StatCard";
import DetailActions from "../UI/Detail/DetailActions";


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
    <PageContainer>

      <PageHeader
        title="Product Details"
      >
        <Button variant="danger">
          Delete Product
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
      <div className="mt-3">
        <DetailActions
          onAdd={() => {
            console.log("Add new product");
          }}
          onEdit={() => {
            console.log("Edit product", product.id);
          }}
        />
      </div>



    </PageContainer>
  );
};


export default ProductDetail;