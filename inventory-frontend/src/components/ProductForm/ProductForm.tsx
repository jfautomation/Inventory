import React, { useState, useEffect } from "react";
import { ProductService } from "../../services/productService";
import { Term, Product, ProductPayload } from "../../types";
import { normalizeProduct } from "../../utils/normalizeProduct";
import { uploadImage } from "../../services/mediaService";

type Props = {
  brands: Term[];
  conditions: Term[];
  shelves: Term[];
  categories: Term[];
  series: any[];

  onCreated?: (product: Product) => void;
  onUpdated?: (product: Product) => void;

  editingProduct?: Product | null;
  clearEditing?: () => void;

  onClose?: () => void; // modal close hook
};

const ProductForm: React.FC<Props> = ({
  brands,
  conditions,
  shelves,
  onCreated,
  onUpdated,
  editingProduct,
  clearEditing,
  onClose,
}) => {

  console.log("onUpdated exists?", !!onUpdated);
  // =========================
  // STATE
  // =========================
  const [inventoryStatus, setInventoryStatus] =
    useState<"active" | "sold" | "archived">("active");

  const [title, setTitle] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [listPrice, setListPrice] = useState(0);
  const [notes, setNotes] = useState("");

  const [testStatus, setTestStatus] = useState(false);
  const [testDate, setTestDate] = useState("");

  // relations
  const [selectedBrand, setSelectedBrand] = useState<Term | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Term | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<Term | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);

  const [parts, setParts] = useState<Term[]>([]);
  const [selectedPart, setSelectedPart] = useState<Term | null>(null);

  // ui
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingProduct;

  // =========================
  // PREFILL EDIT MODE
  // =========================
  useEffect(() => {
    if (!editingProduct) return;

    setTitle(editingProduct.title || "");
    setSerialNumber(editingProduct.serial_number || "");
    setWorkOrder(editingProduct.work_order || "");
    setInventoryStatus(editingProduct.inventory_status || "active");
    setListPrice(Number(editingProduct.list_price || 0));
    setNotes(editingProduct.notes || "");
    setTestStatus(editingProduct.test_status || false);
    setTestDate(editingProduct.test_date || "");

    setSelectedBrand(editingProduct.brand?.[0] || null);
    setSelectedCondition(editingProduct.condition?.[0] || null);
    setSelectedShelf(editingProduct.shelf?.[0] || null);
    setSelectedSeries(editingProduct.series?.[0] || null);
    setSelectedPart(editingProduct.part?.[0] || null);
  }, [editingProduct]);

  // =========================
  // LOAD PARTS BY BRAND
  // =========================
  useEffect(() => {
    if (!selectedBrand) {
      setParts([]);
      setSelectedPart(null);
      return;
    }

    let active = true;

    import("../../services/taxonomyService")
      .then(({ TaxonomyService }) =>
        TaxonomyService.getPartsByBrand(selectedBrand.id)
      )
      .then((data) => {
        if (active) setParts(data || []);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [selectedBrand]);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const imageId = imageFile
        ? await uploadImage(imageFile)
        : undefined;

      const payload: ProductPayload = {
        title,
        inventory_status: inventoryStatus,
        serial_number: serialNumber,
        work_order: workOrder,
        list_price: listPrice,
        notes,
        test_status: testStatus,
        test_date: testDate,

        part: selectedPart ? [selectedPart.id] : [],
        shelf: selectedShelf ? [selectedShelf.id] : [],
        condition: selectedCondition ? [selectedCondition.id] : [],
        series: selectedSeries ? [selectedSeries.id] : [],

        image_id: imageId,
        status: "publish",
      };

      const res = isEditing
        ? await ProductService.update(editingProduct!.id, payload)
        : await ProductService.create(payload);

      const normalized = normalizeProduct(res);
      console.log("🚀 BEFORE onUpdated");
      isEditing ? onUpdated?.(normalized) : onCreated?.(normalized);
      console.log("🚀 AFTER onUpdated");

      clearEditing?.();
      onClose?.(); // 🔥 modal close
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(JSON.stringify(err?.response?.data || err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div>
      <h2>{isEditing ? "Edit Product" : "Create Product"}</h2>

      {/* STATUS */}
      <select
        value={inventoryStatus}
        onChange={(e) =>
          setInventoryStatus(e.target.value as any)
        }
      >
        <option value="active">Active</option>
        <option value="sold">Sold</option>
        <option value="archived">Archived</option>
      </select>

      {/* FIELDS */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />

      <input
        value={serialNumber}
        onChange={(e) => setSerialNumber(e.target.value)}
        placeholder="Serial Number"
      />

      <input
        value={workOrder}
        onChange={(e) => setWorkOrder(e.target.value)}
        placeholder="Work Order"
      />

      <input
        type="number"
        value={listPrice}
        onChange={(e) => setListPrice(Number(e.target.value))}
        placeholder="Price"
      />

      {/* BRAND */}
      <select
        value={selectedBrand?.id || ""}
        onChange={(e) =>
          setSelectedBrand(
            brands.find((b) => b.id === Number(e.target.value)) || null
          )
        }
      >
        <option value="">Select Brand</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* CONDITION */}
      <select
        value={selectedCondition?.id || ""}
        onChange={(e) =>
          setSelectedCondition(
            conditions.find((c) => c.id === Number(e.target.value)) || null
          )
        }
      >
        <option value="">Select Condition</option>
        {conditions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* SHELF */}
      <select
        value={selectedShelf?.id || ""}
        onChange={(e) =>
          setSelectedShelf(
            shelves.find((s) => s.id === Number(e.target.value)) || null
          )
        }
      >
        <option value="">Select Shelf</option>
        {shelves.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* PART */}
      <select
        value={selectedPart?.id || ""}
        onChange={(e) =>
          setSelectedPart(
            parts.find((p) => p.id === Number(e.target.value)) || null
          )
        }
      >
        <option value="">Select Part</option>
        {parts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* TEST */}
      <label>
        <input
          type="checkbox"
          checked={testStatus}
          onChange={(e) => setTestStatus(e.target.checked)}
        />
        Tested
      </label>

      <input
        type="date"
        value={testDate}
        onChange={(e) => setTestDate(e.target.value)}
      />

      {/* NOTES */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes..."
      />

      {/* IMAGE */}
      <input
        type="file"
        onChange={(e) =>
          setImageFile(e.target.files?.[0] || null)
        }
      />

      {/* ACTIONS */}
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