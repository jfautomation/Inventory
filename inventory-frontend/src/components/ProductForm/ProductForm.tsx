import React, { useState, useEffect } from "react";
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
  clearEditing,
  onClose,
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
  const [listPrice, setListPrice] = useState(0);
  const [notes, setNotes] = useState("");

  const [testStatus, setTestStatus] = useState(false);
  const [testDate, setTestDate] = useState("");

  // Relations
  const [selectedBrand, setSelectedBrand] =
    useState<Term | null>(null);

  const [selectedCondition, setSelectedCondition] =
    useState<Term | null>(null);

  const [selectedShelf, setSelectedShelf] =
    useState<Term | null>(null);

  const [selectedPart, setSelectedPart] =
    useState<Part | null>(null);

  // UI
  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const isEditing = !!editingProduct;

  // =========================================================
  // FILTER PARTS BY BRAND
  //
  // Part type uses:
  //
  // brand_id: string
  //
  // =========================================================

  const parts = selectedBrand
    ? allParts.filter(
        (part) =>
          Number(part.brand_id) === selectedBrand.id
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
      Number(editingProduct.list_price || 0)
    );

    setNotes(
      editingProduct.notes || ""
    );

    setTestStatus(
      editingProduct.test_status || false
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

    // =======================================================
    // PRODUCT.PART CONTAINS Term[]
    //
    // Find the corresponding full Part object from
    // the globally loaded parts.
    // =======================================================

    const productPartId =
      editingProduct.part?.[0]?.id;

    if (productPartId) {
      const fullPart = allParts.find(
        (part) => part.id === productPartId
      );

      setSelectedPart(fullPart || null);
    } else {
      setSelectedPart(null);
    }
  }, [
    editingProduct,
    allParts,
  ]);

  // =========================================================
  // CLEAR PART WHEN BRAND CHANGES
  // =========================================================

  useEffect(() => {
    if (!selectedBrand) {
      setSelectedPart(null);
      return;
    }

    if (!selectedPart) {
      return;
    }

    if (
      Number(selectedPart.brand_id) !==
      selectedBrand.id
    ) {
      setSelectedPart(null);
    }
  }, [
    selectedBrand,
    selectedPart,
  ]);

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // -----------------------------------------------------
      // IMAGE
      // -----------------------------------------------------

      const imageId = imageFile
        ? await uploadImage(imageFile)
        : undefined;

      // -----------------------------------------------------
      // PAYLOAD
      // -----------------------------------------------------

      const payload: ProductPayload = {
        title,

        inventory_status:
          inventoryStatus,

        serial_number:
          serialNumber,

        work_order:
          workOrder,

        list_price:
          listPrice,

        notes,

        test_status:
          testStatus,

        test_date:
          testDate,

        part: selectedPart
          ? [selectedPart.id]
          : [],

        shelf: selectedShelf
          ? [selectedShelf.id]
          : [],

        condition: selectedCondition
          ? [selectedCondition.id]
          : [],

        image_id:
          imageId,

        status: "publish",
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

      // -----------------------------------------------------
      // CLOSE / CLEAR
      // -----------------------------------------------------

      clearEditing?.();
      onClose?.();

    } catch (err: any) {
      console.error(
        "Submit error:",
        err
      );

      alert(
        JSON.stringify(
          err?.response?.data ||
          err?.message ||
          err
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
        placeholder="Serial Number"
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
        value={listPrice}
        onChange={(e) =>
          setListPrice(
            Number(e.target.value)
          )
        }
        placeholder="Price"
      />

      {/* =====================================================
          BRAND
      ===================================================== */}

      <select
        value={
          selectedBrand?.id || ""
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
        }}
      >
        <option value="">
          Select Brand
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
          Select Condition
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
              : "Select Part"}
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
        <input
          type="checkbox"
          checked={testStatus}
          onChange={(e) =>
            setTestStatus(
              e.target.checked
            )
          }
        />

        Tested
      </label>

      {/* =====================================================
          TEST DATE
      ===================================================== */}

      <input
        type="date"
        value={testDate}
        onChange={(e) =>
          setTestDate(
            e.target.value
          )
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
        placeholder="Notes..."
      />

      {/* =====================================================
          IMAGE
      ===================================================== */}

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
          ACTION
      ===================================================== */}

      <button
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

