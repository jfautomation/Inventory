import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/wp/v2/product");
      setProducts(res.data);
    };

    fetch();
  }, []);

  return (
    <div>
      <h1>Products</h1>

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
            <div><strong>{p.title}</strong></div>
            <div>Serial: {p.serial_number}</div>
            <div>WO: {p.work_order}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;