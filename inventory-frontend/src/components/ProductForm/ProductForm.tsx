import React, { useState, useEffect } from "react";
import { ProductService } from "../../services/productService";
import { Term, Product, ProductPayload } from "../../types";
import { normalizeProduct } from "../../utils/normalizeProduct";
import { TaxonomyService } from "../../services/taxonomyService";

type Props = {
  brands: Term[];
  shelves: Term[];
  onCreated?: (product: Product) => void;
  conditions: Term[];
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
  conditions
}) => {

  const [serialNumber, setSerialNumber] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [testStatus, setTestStatus] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<Term | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Term | null>(null);
  const [listPrice, setListPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [testDate, setTestDate] = useState("");

  const [selectedBrand, setSelectedBrand] = useState<Term | null>(null);
  const [parts, setParts] = useState<Term[]>([]);
  const [selectedPart, setSelectedPart] = useState<Term | null>(null);

  const [partDetails, setPartDetails] = useState<any | null>(null);

  const [showPartModal, setShowPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState("");

  const [loading, setLoading] = useState(false);

  const isEditing = !!editingProduct;

  // --------------------------------------------------
  // PREFILL (EDIT MODE SAFE)
  // --------------------------------------------------
  useEffect(() => {
    if (!editingProduct) return;

    setSerialNumber(editingProduct.serial_number || "");
    setWorkOrder(editingProduct.work_order || "");
    setTestStatus(editingProduct.test_status || false);
    setSelectedShelf(editingProduct.shelf?.[0] || null);
    setSelectedCondition(editingProduct.condition?.[0] || null);
    setListPrice(editingProduct.list_price || "");
    setNotes(editingProduct.notes || "");
    setTestDate(editingProduct.test_date || "");

    setSelectedBrand(editingProduct.brand?.[0] || null);
    setSelectedPart(editingProduct.part?.[0] || null);
  }, [editingProduct]);

  // --------------------------------------------------
  // LOAD PARTS WHEN BRAND CHANGES
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedBrand) {
      setParts([]);
      setSelectedPart(null);
      return;
    }

    let active = true;

    TaxonomyService.getPartsByBrand(selectedBrand.id)
      .then((data) => {
        if (active) setParts(data || []);
      })
      .catch((err) => console.error("Parts load failed:", err));

    return () => {
      active = false;
    };
  }, [selectedBrand]);

  // --------------------------------------------------
  // LOAD PART DETAILS
  // --------------------------------------------------
  useEffect(() => {
  if (!selectedPart || typeof selectedPart.id !== "number") {
    setPartDetails(null);
    return;
  }

  let active = true;

  TaxonomyService.getPart(selectedPart.id)
    .then((data) => {
      if (active) setPartDetails(data);
    })
    .catch((err) => console.error("Part details failed:", err));

  return () => {
    active = false;
  };
}, [selectedPart]);

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------
  const resetForm = () => {
    setSerialNumber("");
    setWorkOrder("");
    setTestStatus(false);
    setSelectedShelf(null);
    setSelectedCondition(null);
    setListPrice("");
    setNotes("");
    setTestDate("");

    setSelectedBrand(null);
    setSelectedPart(null);
    setParts([]);
    setPartDetails(null);
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload: ProductPayload = {
        part: selectedPart ? [selectedPart.id] : [],

        serial_number: serialNumber,
        work_order: workOrder,
        shelf: selectedShelf ? [selectedShelf.id] : [],
        condition: selectedCondition ? [selectedCondition.id] : [],

        test_status: testStatus ? 1 : 0,
        test_date: testDate,
        list_price: listPrice,
        notes,
        status: "publish",
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

  // --------------------------------------------------
  // CREATE PART (MINIMAL SAFE FLOW)
  // --------------------------------------------------
  const handleCreatePart = async () => {
    if (!newPartName || !selectedBrand) return;

    try {
      const res = await TaxonomyService.createPart({
        name: newPartName,
        brand_id: selectedBrand.id,
      });

      const newPart: Term = {
        id: res.id,
        name: res.name,
        slug: res.slug,
      };

      setParts((prev) => [...prev, newPart]);
      setSelectedPart(newPart);
      setShowPartModal(false);
      setNewPartName("");
    } catch (err) {
      console.error("Create part failed:", err);
    }
  };

  console.log("PART DETAILS:", partDetails);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div>
      <h2>{isEditing ? "Edit Product" : "Create Product"}</h2>

      {/* SERIAL */}
      <input
        placeholder="Serial Number"
        value={serialNumber}
        onChange={(e) => setSerialNumber(e.target.value)}
      />
      {/* WORK ORDER */}
      <input
        placeholder="Work Order"
        value={workOrder}
        onChange={(e) => setWorkOrder(e.target.value)}
      />

      {/* CONDITION */}
<select
  value={selectedCondition?.id ?? ""}
  onChange={(e) => {
    const condition =
      conditions.find((c) => c.id === Number(e.target.value)) || null;

    setSelectedCondition(condition);
  }}
>
  <option value="">Select Condition</option>

  {conditions.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</select>

      {/* BRAND */}
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

      {/* PART */}
      <select
        value={selectedPart?.id ?? ""}
        onChange={(e) => {
          const part =
            parts.find((p) => p.id === Number(e.target.value)) || null;

          setSelectedPart(part);
        }}
        disabled={!selectedBrand}
      >
        <option value="">
          {selectedBrand ? "Select Part" : "Select Brand First"}
        </option>

        {parts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* CREATE PART BUTTON */}
      {selectedBrand && parts.length === 0 && (
        <button onClick={() => setShowPartModal(true)}>
          + Create Part
        </button>
      )}





      {/* TESTED */}
      <div style={{ marginTop: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={testStatus}
            onChange={(e) => setTestStatus(e.target.checked)}
          />
          {" "}Tested
        </label>
      </div>

      {/* SUBMIT */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
      </button>

      {/* MODAL */}
      {showPartModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ background: "#fff", padding: 20, width: 300 }}>
            <h3>Create Part</h3>

            <input
              placeholder="Part name"
              value={newPartName}
              onChange={(e) => setNewPartName(e.target.value)}
            />

            <button onClick={handleCreatePart}>Save</button>
            <button onClick={() => setShowPartModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;