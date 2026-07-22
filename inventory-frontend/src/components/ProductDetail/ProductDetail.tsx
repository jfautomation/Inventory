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



  return (
    <div>

      <h1>
        {product.title}
      </h1>


      <p>
        Serial: {product.serial_number}
      </p>


      <p>
        Work Order: {product.work_order}
      </p>


      <p>
        Notes: {product.notes}
      </p>


      {product.image && (
        <img
          src={product.image}
          style={{
            maxWidth:300
          }}
        />
      )}

    </div>
  );
};


export default ProductDetail;