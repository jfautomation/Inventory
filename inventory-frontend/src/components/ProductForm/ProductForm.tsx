import React, { useState } from "react";
import axios from "axios";

type Term = {
  id: number;
  name: string;
};

type Props = {
  brands: Term[];
  onCreated?: (product: any) => void;
};

const ProductForm: React.FC<Props> = ({ onCreated }) => {
  const [title, setTitle] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

  const handleCreate = async () => {
  try {
    const res = await axios.post(
      "http://jf-auto-inventory-clone-2.local/wp-json/wp/v2/product",
      {
        title,
        status: "publish",

        // ✅ ADD THIS
        brand: selectedBrand ? [selectedBrand] : [],

        meta: {
          serial_number: serialNumber,
        },
      },
      {
        auth: {
          username: "tatyana",
          password: "GUFS YPSt UPYE N231 vOPD cFQN",
        },
      }
    );

    console.log("Saved to WP:", res.data);

    if (onCreated) {
      onCreated(res.data);
    }

    setTitle("");
    setSerialNumber("");
    setSelectedBrand(null); // reset
  } catch (err) {
    console.error("WP create failed:", err);
  }
};

  return (
    <div>
      <h2>Create Product</h2>

      <input
        placeholder="Product title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="Serial Number"
        value={serialNumber}
        onChange={(e) => setSerialNumber(e.target.value)}
      />

      <button onClick={handleCreate}>Create</button>
    </div>
  );
};

export default ProductForm;