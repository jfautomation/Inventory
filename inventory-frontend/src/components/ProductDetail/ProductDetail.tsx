import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/client";

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  const [product, setProduct] = useState<any>(
    location.state?.product || null
  );

  useEffect(() => {
    if (product) return; // already have it → NO FETCH

    const fetchProduct = async () => {
      const res = await api.get(`/wp/v2/product/${id}`);
      setProduct(res.data);
    };

    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>Serial: {product.serial_number}</p>
      <p>Work Order: {product.work_order}</p>
      <p>Notes: {product.notes}</p>

      {product.image && (
        <img src={product.image} style={{ maxWidth: 300 }} />
      )}
    </div>
  );
};

export default ProductDetail;