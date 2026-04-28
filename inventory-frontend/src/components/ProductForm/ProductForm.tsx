import React, { useState, useEffect } from "react";
import axios from "axios";
import { Product, Term } from "../../types";
import { normalizeProduct } from "../../utils/normalizeProduct";

type Props = {
  brands: Term[];
  onCreated?: (product: any) => void;
  editingProduct: Product | null;
  onUpdated?: (product: any) => void; // optional but useful later
  clearEditing?: () => void; // IMPORTANT: lets parent exit edit mode
};

const ProductForm: React.FC<Props> = ({
  brands,
  onCreated,
  editingProduct,
  onUpdated,
  clearEditing,
}) => {
  const [title, setTitle] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [testStatus, setTestStatus] = useState(false);
  const [condition, setCondition] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [testDate, setTestDate] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

  const isEditing = !!editingProduct;


 // -----------------------
// PREFILL WHEN EDITING
// -----------------------
useEffect(() => {
  if (!editingProduct) return;

  setTitle(editingProduct.title || "");
  setSerialNumber(editingProduct.serial_number || "");
  setSelectedBrand(editingProduct.brand?.[0] || null);
  setWorkOrder(editingProduct.work_order || "");
  setTestStatus(editingProduct.test_status || false);
  setCondition(editingProduct.condition || "");
  setListPrice(editingProduct.list_price || "");
  setNotes(editingProduct.notes || "");
  setTestDate(editingProduct.test_date || "");
}, [editingProduct]);


  
// CREATE / UPDATE
// -----------------------
const handleSubmit = async () => {
  try {
    const url = isEditing
      ? `http://jf-auto-inventory-clone-2.local/wp-json/wp/v2/product/${editingProduct!.id}`
      : "http://jf-auto-inventory-clone-2.local/wp-json/wp/v2/product";

    const payload = {
      title,
      status: "publish",

      brand: selectedBrand ? [selectedBrand] : [],

      serial_number: serialNumber,
      work_order: workOrder,
      test_status: testStatus,
      condition,
      list_price: listPrice,
      notes,
      test_date: testDate,
   };

    const res = await axios({
     method: isEditing ? "put" : "post", // 🔥 FIX
     url,
     data: payload,
     auth: {
        username: "tatyana",
         password: "GUFS YPSt UPYE N231 vOPD cFQN",
     },
  });

    console.log(isEditing ? "Updated in WP:" : "Created in WP:", res.data);

    if (isEditing && onUpdated) {
  onUpdated(normalizeProduct(res.data));
} else if (!isEditing && onCreated) {
  onCreated(normalizeProduct(res.data));
}

    // reset form
    setTitle("");
    setSerialNumber("");
    setSelectedBrand(null);

    setWorkOrder("");
    setTestStatus(false);
    setCondition("");
    setListPrice("");
    setNotes("");
    setTestDate("");

    // exit edit mode
    if (clearEditing) {
      clearEditing();
    }
  } catch (err) {
    console.error("WP save failed:", err);
  }
};

  return (
    <div>
      <h2>{isEditing ? "Edit Product" : "Create Product"}</h2>

      {/* TITLE */}
      <input
        placeholder="Product title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* SERIAL NUMBER */}
      <input
        placeholder="Serial Number"
        value={serialNumber}
        onChange={(e) => setSerialNumber(e.target.value)}
      />

      {/* BRAND SELECT */}
      <select
        value={selectedBrand ?? ""}
        onChange={(e) =>
          setSelectedBrand(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Select Brand</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* BUTTON */}
      <button onClick={handleSubmit}>
        {isEditing ? "Update Product" : "Create Product"}
      </button>
    </div>
  );
};

export default ProductForm;