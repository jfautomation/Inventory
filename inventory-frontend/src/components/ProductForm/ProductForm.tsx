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
  conditions,
  shelves
}) => {

  const [inventoryStatus, setInventoryStatus] =
    useState<"active" | "sold" | "archived">("active");
  const [serialNumber, setSerialNumber] = useState("");
  const [partsLoading, setPartsLoading] = useState(false);
  const [workOrder, setWorkOrder] = useState("");
  const [testStatus, setTestStatus] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState<Term | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<Term | null>(null);
  const [listPrice, setListPrice] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [testDate, setTestDate] = useState("");

  const [selectedBrand, setSelectedBrand] = useState<Term | null>(null);
  const [parts, setParts] = useState<Term[]>([]);
  const [selectedPart, setSelectedPart] = useState<Term | null>(null);

  const [partDetails, setPartDetails] = useState<any | null>(null);

  const [showPartModal, setShowPartModal] = useState(false);
  const [newPartName, setNewPartName] = useState("");

  const [loading, setLoading] = useState(false);
  const [partSearch, setPartSearch] = useState("");

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

    setListPrice(
      editingProduct.list_price == null
        ? 0
        : Number(editingProduct.list_price)
    );

    setNotes(editingProduct.notes || "");
    setTestDate(editingProduct.test_date || "");

    setSelectedBrand(editingProduct.brand?.[0] || null);
    setSelectedPart(editingProduct.part?.[0] || null);

    // ✅ ADD THESE
    setInventoryStatus(editingProduct.inventory_status || "active");
    setSelectedSeries(editingProduct.series?.[0] || null);
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

    setPartsLoading(true);
    setParts([]);
    setSelectedPart(null);

    TaxonomyService.getPartsByBrand(selectedBrand.id)
      .then((data) => {
        if (!active) return;
        setParts(data || []);
      })
      .catch((err) => {
        console.error("Parts load failed:", err);
      })
      .finally(() => {
        if (active) setPartsLoading(false);
      });

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
  // LOAD SERIES WHEN BRAND CHANGES
  // --------------------------------------------------
  useEffect(() => {
    const brandId = selectedBrand?.id;

    // reset immediately when brand changes
    setSeries([]);
    setSelectedSeries(null);

    if (!brandId) return;

    let active = true;

    TaxonomyService.getSeriesByBrand(brandId)
      .then((data) => {
        if (!active) return;
        setSeries(data || []);
      })
      .catch((err) => {
        console.error("Series load failed:", err);
      });

    return () => {
      active = false;
    };
  }, [selectedBrand?.id]);

  // --------------------------------------------------
  // RESET
  // --------------------------------------------------
  const resetForm = () => {
    setSerialNumber("");
    setWorkOrder("");
    setTestStatus(false);
    setSelectedShelf(null);
    setSelectedCondition(null);

    setListPrice(0); // ✅ FIXED

    setNotes("");
    setTestDate("");

    setInventoryStatus("active"); // ✅ ADD

    setSelectedBrand(null);
    setSelectedPart(null);
    setSelectedSeries(null); // ✅ ADD

    setParts([]);
    setSeries([]);
    setPartDetails(null);
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload: ProductPayload = {
        inventory_status: inventoryStatus,
        part: selectedPart ? [selectedPart.id] : [],

        serial_number: serialNumber,
        work_order: workOrder,

        shelf: selectedShelf ? [selectedShelf.id] : [],
        condition: selectedCondition ? [selectedCondition.id] : [],
        series: selectedSeries ? [selectedSeries.id] : [],

        test_status: !!testStatus, // ✅ boolean conversion
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
    } catch (err: any) {
      console.error("Save failed:", err);

      const apiError = err?.response?.data;

      const code = apiError?.code;
      const message = apiError?.message;

      if (code === "duplicate_serial_number") {
        alert("Serial number already exists. Please use a unique one.");
        return;
      }

      if (code === "duplicate_work_order") {
        alert("Work order already exists. Please use a unique one.");
        return;
      }

      alert(message || err?.message || "Failed to save product.");
    }

    finally {
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

      // update list
      setParts((prev) => [...prev, newPart]);

      // auto-select newly created part
      setSelectedPart(newPart);

      // cleanup modal state
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
      <select
        value={inventoryStatus}
        onChange={(e) =>
          setInventoryStatus(
            e.target.value as "active" | "sold" | "archived"
          )
        }
      >
        <option value="active">Active</option>
        <option value="sold">Sold</option>
        <option value="archived">Archived</option>
      </select>

      <div style={{ marginTop: 10 }}>
        <label>Price</label>

        <input
          type="number"
          step="0.01"
          placeholder="Enter price"
          value={listPrice}
          onChange={(e) => setListPrice(Number(e.target.value))}
        />
      </div>

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

      <div>

        <select
          value={selectedSeries?.id || ""}
          onChange={(e) => {
            const id = Number(e.target.value);
            const obj = series.find((s) => s.id === id) || null;
            setSelectedSeries(obj);
          }}
          disabled={!selectedBrand}
        >
          <option value="">Select Series</option>

          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label>Shelf</label>

        <select
          value={selectedShelf?.id || ""}
          onChange={(e) => {
            const shelf = shelves.find(
              (s) => s.id === Number(e.target.value)
            );
            setSelectedShelf(shelf || null);
          }}
        >
          <option value="">Select shelf</option>

          {shelves.map((shelf) => (
            <option key={shelf.id} value={shelf.id}>
              {shelf.name}
            </option>
          ))}
        </select>
      </div>

      {/* PART */}
      <select
        value={selectedPart?.id ?? ""}
        onChange={(e) => {
          const value = e.target.value;

          if (value === "create_new") {
            setShowPartModal(true);
            return;
          }

          const part =
            parts.find((p) => p.id === Number(value)) || null;

          setSelectedPart(part);
        }}
        disabled={!selectedBrand || partsLoading}
      >
        {/* DEFAULT STATE */}
        <option value="">
          {!selectedBrand
            ? "Select Brand First"
            : partsLoading
              ? "Loading parts..."
              : "Select Part"}
        </option>

        {/* EXISTING PARTS */}
        {parts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}

        {/* CREATE OPTION */}
        {selectedBrand && !partsLoading && (
          <option value="create_new">
            + Part not found? Create one
          </option>
        )}
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

      <div style={{ marginTop: 10 }}>
        <label>Test Date</label>

        <input
          type="date"
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
        />
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