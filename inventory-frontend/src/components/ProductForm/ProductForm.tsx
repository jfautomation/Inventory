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

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full max-w-4xl">

      {/* =====================================================
        FORM HEADER
    ===================================================== */}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEditing ? "Edit Product" : "Create Product"}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? "Update the product information below."
            : "Add a new product to your inventory."}
        </p>
      </div>


      {/* =====================================================
        FORM
    ===================================================== */}

      <div className="space-y-8">

        {/* ===================================================
          BASIC INFORMATION
      =================================================== */}

        <section>

          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Basic Information
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Identify the product and link it to the appropriate part.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* TITLE */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brand New Siemens Drive"
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              />
            </div>


            {/* BRAND */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Brand <span className="text-red-500">*</span>
              </label>

              <select
                value={selectedBrand?.id ?? ""}
                onChange={(e) => {
                  const brand =
                    brands.find(
                      (b) => b.id === Number(e.target.value)
                    ) || null;

                  setSelectedBrand(brand);
                  setSelectedPart(null);
                }}
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              >
                <option value="">
                  Select Brand
                </option>

                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>


            {/* PART */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Part Number <span className="text-red-500">*</span>
              </label>

              <select
                value={selectedPart?.id || ""}
                disabled={!selectedBrand}
                onChange={(e) => {
                  const part =
                    parts.find(
                      (p) => p.id === Number(e.target.value)
                    ) || null;

                  setSelectedPart(part);
                }}
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                disabled:cursor-not-allowed
                disabled:bg-gray-100
                disabled:text-gray-400
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              >
                <option value="">
                  {!selectedBrand
                    ? "Select Brand First"
                    : parts.length === 0
                      ? "No Parts Available"
                      : "Select Part Number"}
                </option>

                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>


            {/* SERIAL NUMBER */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Serial Number <span className="text-red-500">*</span>
              </label>

              <input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Enter serial number"
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              />
            </div>


            {/* WORK ORDER */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Work Order
              </label>

              <input
                value={workOrder}
                onChange={(e) => setWorkOrder(e.target.value)}
                placeholder="Enter work order"
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              />
            </div>

          </div>
        </section>


        {/* ===================================================
          INVENTORY INFORMATION
      =================================================== */}

        <section>

          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Inventory Information
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Set the current inventory and condition details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* STATUS */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

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
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              >
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="archived">Archived</option>
              </select>
            </div>


            {/* CONDITION */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Condition <span className="text-red-500">*</span>
              </label>

              <select
                value={selectedCondition?.id || ""}
                onChange={(e) => {
                  const condition =
                    conditions.find(
                      (c) => c.id === Number(e.target.value)
                    ) || null;

                  setSelectedCondition(condition);
                }}
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              >
                <option value="">
                  Select Condition
                </option>

                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>


            {/* PRICE */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                List Price
              </label>

              <div className="relative">
                <span className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-sm
                text-gray-400
              ">
                  $
                </span>

                <input
                  type="number"
                  min="0"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  placeholder="0.00"
                  className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  py-2.5
                  pl-7
                  pr-3
                  text-sm
                  text-gray-900
                  shadow-sm
                  outline-none
                  focus:border-gray-400
                  focus:ring-2
                  focus:ring-gray-200
                "
                />
              </div>
            </div>


            {/* SHELF */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Shelf
              </label>

              <select
                value={selectedShelf?.id || ""}
                onChange={(e) => {
                  const shelf =
                    shelves.find(
                      (s) => s.id === Number(e.target.value)
                    ) || null;

                  setSelectedShelf(shelf);
                }}
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              >
                <option value="">
                  Select Shelf
                </option>

                {shelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </section>


        {/* ===================================================
          TESTING
      =================================================== */}

        <section>

          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Testing
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Record whether the product has been tested and when.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* TEST STATUS */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                  if (e.target.value === "tested") {
                    setTestStatus(true);
                  } else if (e.target.value === "not-tested") {
                    setTestStatus(false);
                    setTestDate("");
                  } else {
                    setTestStatus(null);
                    setTestDate("");
                  }
                }}
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
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
            </div>


            {/* TEST DATE */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Test Date
              </label>

              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                disabled={testStatus !== true}
                className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                disabled:cursor-not-allowed
                disabled:bg-gray-100
                disabled:text-gray-400
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              />
            </div>

          </div>
        </section>


        {/* ===================================================
          NOTES & IMAGE
      =================================================== */}

        <section>

          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">
              Additional Information
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add notes or an image to help identify the product.
            </p>
          </div>

          <div className="space-y-5">

            {/* NOTES */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this product..."
                rows={4}
                className="
                w-full
                resize-y
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-900
                shadow-sm
                outline-none
                placeholder:text-gray-400
                focus:border-gray-400
                focus:ring-2
                focus:ring-gray-200
              "
              />
            </div>


            {/* IMAGE */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Product Image
              </label>

            <input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setImageFile(e.target.files?.[0] || null)
  }
  className="
    block
    w-fit
    max-w-full
    rounded-lg
    border
    border-gray-300
    bg-white
    px-3
    py-2
    text-sm
    text-gray-600
    file:mr-4
    file:rounded-md
    file:border-0
    file:bg-gray-100
    file:px-3
    file:py-1.5
    file:text-sm
    file:font-medium
    file:text-gray-700
  "
/>
            </div>

          </div>
        </section>


        {/* ===================================================
          FOOTER
      =================================================== */}

        <div className="
        flex
        flex-col
        gap-3
        border-t
        border-gray-200
        pt-6
        sm:flex-row
        sm:items-center
        sm:justify-end
      ">

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            bg-blue-600
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
          >
            {loading
              ? "Saving..."
              : isEditing
                ? "Update Product"
                : "Create Product"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default ProductForm;

