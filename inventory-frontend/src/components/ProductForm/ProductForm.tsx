import React, { useState, useEffect } from "react";
import { ProductService } from "../../services/productService";
import { Term, Product, ProductPayload } from "../../types";
import { normalizeProduct } from "../../utils/normalizeProduct";

type Props = {
  brands: Term[];
  onCreated?: (product: Product) => void;
  editingProduct: Product | null;
  onUpdated?: (product: Product) => void;
  clearEditing?: () => void;
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
  const [selectedBrand, setSelectedBrand] = useState<Term | null>(null);

  const [loading, setLoading] = useState(false);

  const isEditing = !!editingProduct;

  // -----------------------
  // PREFILL
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

  // -----------------------
  // RESET
  // -----------------------
  const resetForm = () => {
    setTitle("");
    setSerialNumber("");
    setWorkOrder("");
    setTestStatus(false);
    setCondition("");
    setListPrice("");
    setNotes("");
    setTestDate("");
    setSelectedBrand(null);
  };

  // -----------------------
  // SUBMIT
  // -----------------------
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // ✅ strongly typed payload
      const payload: ProductPayload = {
        title,
        status: "publish",
        brand: selectedBrand ? [selectedBrand.id] : [],
        serial_number: serialNumber,
        work_order: workOrder,
        test_status: testStatus ? 1 : 0,
        condition,
        list_price: listPrice,
        notes,
        test_date: testDate,
      };

      const res = isEditing
        ? await ProductService.update(editingProduct!.id, payload)
        : await ProductService.create(payload);

      const normalized = normalizeProduct(res);

      if (isEditing) onUpdated?.(normalized);
      else onCreated?.(normalized);

      resetForm();
      clearEditing?.();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEditing ? "Edit Product" : "Create Product"}</h2>

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

      <select
        value={selectedBrand?.id ?? ""}
        onChange={(e) => {
          const brand =
            brands.find((b) => b.id === Number(e.target.value)) || null;
          setSelectedBrand(brand);
        }}
      >
        <option value="">Select Brand</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <button onClick={handleSubmit} disabled={loading}>
        {loading
          ? "Saving..."
          : isEditing
          ? "Update Product"
          : "Create Product"}
      </button>
    </div>
  );
};

export default ProductForm;