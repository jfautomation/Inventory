import React, { useEffect, useState } from "react";
import { ProductService } from "../../services/productService";
import {
  Term,
  Product,
  ProductPayload,
  Part,
} from "../../types";
import { normalizeProduct } from "../../utils/normalizeProduct";
import { uploadImage } from "../../services/mediaService";
import { useInventory } from "../../context/InventoryContext";

type Props = {
  brands: Term[];
  conditions: Term[];
  shelves: Term[];
  categories: Term[];
  series: Term[];
  onCreated?: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  editingProduct?: Product | null;
  clearEditing?: () => void;
  onClose?: () => void;
};

const ProductForm: React.FC<Props> = ({
  brands,
  conditions,
  shelves,
  onCreated,
  onUpdated,
  editingProduct,
}) => {
  // =========================================================
  // GLOBAL INVENTORY DATA
  // =========================================================

  const { parts: allParts } = useInventory();

  // =========================================================
  // STATE
  // =========================================================

  const [inventoryStatus, setInventoryStatus] =
    useState<"active" | "sold" | "archived">("active");

  const [title, setTitle] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [notes, setNotes] = useState("");

  // null = user has not selected a test status yet
  const [testStatus, setTestStatus] =
    useState<boolean | null>(null);

  const [testDate, setTestDate] = useState("");

  const [selectedBrand, setSelectedBrand] =
    useState<Term | null>(null);

  const [selectedCondition, setSelectedCondition] =
    useState<Term | null>(null);

  const [selectedShelf, setSelectedShelf] =
    useState<Term | null>(null);

  const [selectedPart, setSelectedPart] =
    useState<Part | null>(null);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const isEditing = !!editingProduct;

  // =========================================================
  // FILTER PARTS BY BRAND
  // =========================================================

  const parts = selectedBrand
    ? allParts.filter(
      (part) =>
        Number(part.brand_id) ===
        Number(selectedBrand.id)
    )
    : [];

  // =========================================================
  // PREFILL EDIT MODE
  // =========================================================

  useEffect(() => {
    if (!editingProduct) {
      return;
    }

    setTitle(editingProduct.title || "");

    setSerialNumber(
      editingProduct.serial_number || ""
    );

    setWorkOrder(
      editingProduct.work_order || ""
    );

    setInventoryStatus(
      editingProduct.inventory_status || "active"
    );

    setListPrice(
      editingProduct.list_price != null
        ? String(editingProduct.list_price)
        : ""
    );

    setNotes(
      editingProduct.notes || ""
    );

    setTestStatus(
      typeof editingProduct.test_status === "boolean"
        ? editingProduct.test_status
        : null
    );

    setTestDate(
      editingProduct.test_date || ""
    );

    setSelectedBrand(
      editingProduct.brand?.[0] || null
    );

    setSelectedCondition(
      editingProduct.condition?.[0] || null
    );

    setSelectedShelf(
      editingProduct.shelf?.[0] || null
    );
  }, [editingProduct]);

  // =========================================================
  // PREFILL EXISTING PART IN EDIT MODE
  // =========================================================

  useEffect(() => {
    if (!editingProduct) {
      setSelectedPart(null);
      return;
    }

    const productPartId =
      editingProduct.part?.[0]?.id;

    if (!productPartId) {
      setSelectedPart(null);
      return;
    }

    const fullPart = allParts.find(
      (part) =>
        Number(part.id) === Number(productPartId)
    );

    setSelectedPart(
      fullPart || null
    );
  }, [
    editingProduct,
    allParts,
  ]);

  // =========================================================
  // CLEAR PART WHEN BRAND CHANGES
  // =========================================================

  useEffect(() => {
    if (!selectedBrand || !selectedPart) {
      return;
    }

    if (
      Number(selectedPart.brand_id) !==
      Number(selectedBrand.id)
    ) {
      setSelectedPart(null);
    }
  }, [
    selectedBrand,
    selectedPart,
  ]);

  // =========================================================
  // REQUIRED FIELD VALIDATION
  //
  // REQUIRED:
  // Serial Number
  // Brand
  // Condition
  // Part
  //
  // OPTIONAL:
  // Status
  // List Price
  // Work Order
  // Notes
  // Test Status
  // Test Date
  // Image
  // Title
  // =========================================================

  const missingFields: string[] = [];

  if (!selectedBrand) {
    missingFields.push("Brand");
  }

  if (!selectedPart) {
    missingFields.push("Part Number");
  }

  if (!serialNumber.trim()) {
    missingFields.push("Serial Number");
  }

  if (!selectedCondition) {
    missingFields.push("Condition");
  }

  const hasRequiredFields =
    missingFields.length === 0;
  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    if (!hasRequiredFields) {
      alert(
        `Please complete the following required fields:\n\n${missingFields.join(
          "\n"
        )}`
      );

      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------------------
      // IMAGE
      // -----------------------------------------------------
      // Optional. Preserve existing image when editing.
      // -----------------------------------------------------

      const imageId = imageFile
        ? await uploadImage(imageFile)
        : editingProduct?.image_id;

      // -----------------------------------------------------
      // PAYLOAD
      // -----------------------------------------------------

      const payload: ProductPayload = {
        title: title.trim(),

        serial_number: serialNumber.trim(),

        ...(listPrice.trim()
          ? { list_price: Number(listPrice) }
          : {}),

        part: [
          selectedPart!.id,
        ],

        condition: [
          selectedCondition!.id,
        ],

        status: "publish",

        ...(workOrder.trim()
          ? { work_order: workOrder.trim() }
          : {}),

        ...(notes.trim()
          ? { notes: notes.trim() }
          : {}),

        ...(selectedShelf
          ? { shelf: [selectedShelf.id] }
          : {}),

        ...(testStatus !== null
          ? { test_status: testStatus }
          : {}),

        ...(testDate.trim()
          ? { test_date: testDate }
          : {}),

        ...(inventoryStatus
          ? { inventory_status: inventoryStatus }
          : {}),

        ...(imageId
          ? { image_id: imageId }
          : {}),
      };

      // -----------------------------------------------------
      // CREATE / UPDATE
      // -----------------------------------------------------

      const res = isEditing
        ? await ProductService.update(
          editingProduct!.id,
          payload
        )
        : await ProductService.create(
          payload
        );

      // -----------------------------------------------------
      // NORMALIZE
      // -----------------------------------------------------

      const normalized =
        normalizeProduct(res);

      // -----------------------------------------------------
      // CALLBACK
      // -----------------------------------------------------

      if (isEditing) {
        onUpdated?.(normalized);
      } else {
        onCreated?.(normalized);
      }

    } catch (err: any) {
      console.error(
        "Submit error:",
        err
      );

      console.error(
        "API ERROR:",
        err?.response?.data
      );

      alert(
        JSON.stringify(
          err?.response?.data ||
          err?.message ||
          "Failed to save product."
        )
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>

      <h2>
        {isEditing
          ? "Edit Product"
          : "Create Product"}
      </h2>


      {/* =====================================================
          STATUS
      ===================================================== */}

      <select
        value={inventoryStatus}
        onChange={(e) =>
          setInventoryStatus(
            e.target.value as
            | "active"
            | "sold"
            | "archived"
          )
        }
      >
        <option value="">
          Select Status
        </option>

        <option value="active">
          Active
        </option>

        <option value="sold">
          Sold
        </option>

        <option value="archived">
          Archived
        </option>
      </select>


      {/* =====================================================
          TITLE
      ===================================================== */}

      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        placeholder="Title"
      />


      {/* =====================================================
          SERIAL NUMBER
      ===================================================== */}

      <input
        value={serialNumber}
        onChange={(e) =>
          setSerialNumber(
            e.target.value
          )
        }
        placeholder="Serial Number *"
      />


      {/* =====================================================
          WORK ORDER
      ===================================================== */}

      <input
        value={workOrder}
        onChange={(e) =>
          setWorkOrder(
            e.target.value
          )
        }
        placeholder="Work Order"
      />


      {/* =====================================================
          PRICE
      ===================================================== */}

      <input
        type="number"
        min="0"
        value={listPrice}
        onChange={(e) =>
          setListPrice(
            e.target.value
          )
        }
        placeholder="Price"
      />


      {/* =====================================================
          BRAND
      ===================================================== */}

      <select
        value={
          selectedBrand?.id ?? ""
        }
        onChange={(e) => {

          const brand =
            brands.find(
              (b) =>
                b.id ===
                Number(
                  e.target.value
                )
            ) || null;

          setSelectedBrand(
            brand
          );

          // A Part belongs to a Brand,
          // so changing Brand clears Part.
          setSelectedPart(null);
        }}
      >
        <option value="">
          Select Brand *
        </option>

        {brands.map((b) => (
          <option
            key={b.id}
            value={b.id}
          >
            {b.name}
          </option>
        ))}
      </select>


      {/* =====================================================
          CONDITION
      ===================================================== */}

      <select
        value={
          selectedCondition?.id || ""
        }
        onChange={(e) => {

          const condition =
            conditions.find(
              (c) =>
                c.id ===
                Number(
                  e.target.value
                )
            ) || null;

          setSelectedCondition(
            condition
          );
        }}
      >
        <option value="">
          Select Condition *
        </option>

        {conditions.map((c) => (
          <option
            key={c.id}
            value={c.id}
          >
            {c.name}
          </option>
        ))}
      </select>


      {/* =====================================================
          SHELF
      ===================================================== */}

      <select
        value={
          selectedShelf?.id || ""
        }
        onChange={(e) => {

          const shelf =
            shelves.find(
              (s) =>
                s.id ===
                Number(
                  e.target.value
                )
            ) || null;

          setSelectedShelf(
            shelf
          );
        }}
      >
        <option value="">
          Select Shelf
        </option>

        {shelves.map((s) => (
          <option
            key={s.id}
            value={s.id}
          >
            {s.name}
          </option>
        ))}
      </select>


      {/* =====================================================
          PART
      ===================================================== */}

      <select
        value={
          selectedPart?.id || ""
        }
        disabled={!selectedBrand}
        onChange={(e) => {

          const part =
            parts.find(
              (p) =>
                p.id ===
                Number(
                  e.target.value
                )
            ) || null;

          setSelectedPart(
            part
          );
        }}
      >
        <option value="">
          {!selectedBrand
            ? "Select Brand First"
            : parts.length === 0
              ? "No Parts Available"
              : "Select Part *"}
        </option>

        {parts.map((p) => (
          <option
            key={p.id}
            value={p.id}
          >
            {p.name}
          </option>
        ))}
      </select>


      {/* =====================================================
          TEST STATUS
      ===================================================== */}

      <label>
        Test Status
      </label>

      <select
        value={
          testStatus === null
            ? ""
            : testStatus
              ? "tested"
              : "not-tested"
        }
        onChange={(e) => {

          if (
            e.target.value ===
            "tested"
          ) {
            setTestStatus(true);
          } else if (
            e.target.value ===
            "not-tested"
          ) {
            setTestStatus(false);
            setTestDate("");
          } else {
            setTestStatus(null);
            setTestDate("");
          }

        }}
      >
        <option value="">
          Select Test Status
        </option>

        <option value="tested">
          Tested
        </option>

        <option value="not-tested">
          Not Tested
        </option>
      </select>


      {/* =====================================================
          TEST DATE
      ===================================================== */}

      <label>
        Test Date
      </label>

      <input
        type="date"
        value={testDate}
        onChange={(e) =>
          setTestDate(
            e.target.value
          )
        }
        disabled={
          testStatus !== true
        }
      />


      {/* =====================================================
          NOTES
      ===================================================== */}

      <textarea
        value={notes}
        onChange={(e) =>
          setNotes(
            e.target.value
          )
        }
        placeholder="Notes"
      />


      {/* =====================================================
          IMAGE
      ===================================================== */}

      <label>
        Product Image
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setImageFile(
            e.target.files?.[0] ||
            null
          )
        }
      />


      {/* =====================================================
          SAVE
      ===================================================== */}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
      >
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

