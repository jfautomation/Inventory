import React, { useEffect, useState } from "react";
import { Part, Term } from "../../types";
import { TaxonomyService } from "../../services/taxonomyService";
import { uploadImage } from "../../services/mediaService";

type PartResponse = {
  id: number;
  name: string;
  slug: string;
  brand_id: number;
  category_id: number;
  series_id?: number;
  base_price?: string | number;
  description?: string;
  image_id?: number;
  image_url?: string | null;
};

type Props = {
  brands: Term[];
  categories: Term[];

  initialBrand?: Term | null;

  editingPart?: Part | null;
  clearEditing?: () => void;

  onCreated?: (part: PartResponse) => void;
  onUpdated?: (part: PartResponse) => void;
  onClose?: () => void;
};

const PartForm: React.FC<Props> = ({
  brands,
  categories,
  initialBrand = null,
  editingPart = null,
  clearEditing,
  onCreated,
  onUpdated,
  onClose,
}) => {
  // =========================================================
  // STATE
  // =========================================================

  const [selectedBrand, setSelectedBrand] =
    useState<Term | null>(initialBrand);

  const [selectedCategory, setSelectedCategory] =
    useState<Term | null>(null);

  const [partName, setPartName] =
    useState("");

  const [selectedSeries, setSelectedSeries] =
    useState<Term | null>(null);

  const [priceNew, setPriceNew] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [existingImageId, setExistingImageId] =
    useState<number | undefined>(undefined);

  const [availableSeries, setAvailableSeries] =
    useState<Term[]>([]);

  const isEditMode = !!editingPart;


  // =========================================================
  // EDIT MODE PREFILL
  // =========================================================

  useEffect(() => {
    if (!editingPart) {
      return;
    }

    setPartName(editingPart.name || "");

    const brand = editingPart.brand_id
      ? brands.find(
          (b) =>
            b.id === Number(editingPart.brand_id)
        ) || null
      : null;

    setSelectedBrand(brand);

    const category = editingPart.category_id
      ? categories.find(
          (c) =>
            c.id === Number(editingPart.category_id)
        ) || null
      : null;

    setSelectedCategory(category);

    setPriceNew(
      editingPart.base_price != null
        ? String(editingPart.base_price)
        : ""
    );

    setDescription(
      editingPart.description || ""
    );

    setExistingImageId(
      editingPart.image_id
    );
  }, [
    editingPart,
    brands,
    categories,
  ]);


  // =========================================================
  // LOAD SERIES FOR SELECTED BRAND
  // =========================================================

  useEffect(() => {
    if (!selectedBrand) {
      setAvailableSeries([]);
      setSelectedSeries(null);
      return;
    }

    TaxonomyService
      .getSeriesByBrand(selectedBrand.id)
      .then((data) => {
        setAvailableSeries(data || []);
      })
      .catch((err) => {
        console.error(
          "Failed loading series:",
          err
        );

        setAvailableSeries([]);
      });
  }, [selectedBrand]);


  // =========================================================
  // PREFILL SERIES IN EDIT MODE
  // =========================================================

  useEffect(() => {
    if (
      !editingPart?.series_id ||
      availableSeries.length === 0
    ) {
      return;
    }

    const series =
      availableSeries.find(
        (s) =>
          s.id ===
          Number(editingPart.series_id)
      ) || null;

    setSelectedSeries(series);
  }, [
    editingPart,
    availableSeries,
  ]);


  // =========================================================
  // REQUIRED FIELDS
  //
  // REQUIRED:
  // Brand
  // Category
  // Part Name
  //
  // OPTIONAL:
  // Series
  // Base Price
  // Description
  // Image
  // =========================================================

  const hasRequiredFields =
    !!selectedBrand &&
    !!selectedCategory &&
    partName.trim().length > 0;


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {

    if (!hasRequiredFields) {
      alert(
        "Please complete the required fields:\n\nBrand\nCategory\nPart Number / Name"
      );

      return;
    }

    try {
      setLoading(true);


      // -------------------------------------------------------
      // IMAGE
      // -------------------------------------------------------

      const imageId = imageFile
        ? await uploadImage(imageFile)
        : existingImageId;


      // -------------------------------------------------------
      // PAYLOAD
      // -------------------------------------------------------
      //
      // Only send optional fields when they have values.
      // -------------------------------------------------------

      const payload: {
        name: string;
        brand_id: number;
        category_id: number;
        series_id?: number;
        base_price?: number;
        description?: string;
        image_id?: number;
      } = {
        name: partName.trim(),
        brand_id: selectedBrand.id,
        category_id: selectedCategory.id,
      };


      if (selectedSeries) {
        payload.series_id =
          selectedSeries.id;
      }

      if (priceNew.trim()) {
        payload.base_price =
          Number(priceNew);
      }

      if (description.trim()) {
        payload.description =
          description.trim();
      }

      if (imageId) {
        payload.image_id =
          imageId;
      }


      console.log(
        "PART PAYLOAD:",
        payload
      );


      // -------------------------------------------------------
      // CREATE
      // -------------------------------------------------------

      if (!isEditMode) {

        const response: PartResponse =
          await TaxonomyService.createPart(
            payload
          );

        onCreated?.(response);

      }


      // -------------------------------------------------------
      // UPDATE
      // -------------------------------------------------------

      else {

        const response =
          await TaxonomyService.updatePart(
            editingPart!.id,
            payload
          );

        onUpdated?.(response);

      }


      // -------------------------------------------------------
      // RESET
      // -------------------------------------------------------

      setPartName("");
      setSelectedBrand(initialBrand);
      setSelectedCategory(null);
      setSelectedSeries(null);
      setPriceNew("");
      setDescription("");
      setImageFile(null);
      setExistingImageId(undefined);

      clearEditing?.();

    } catch (err: any) {

      console.error(
        "Part save failed:",
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
          "Failed to save part."
        )
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    clearEditing?.();
    onClose?.();
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
        {isEditMode ? "Edit Part" : "Create Part"}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {isEditMode
          ? "Update the part information below."
          : "Add a new part to your parts library."}
      </p>
    </div>


    {/* =====================================================
        BASIC INFORMATION
    ===================================================== */}

    <section>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Basic Information
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Identify the part and assign its classification.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* BRAND */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Brand <span className="text-red-500">*</span>
          </label>

          <select
            value={selectedBrand?.id ?? ""}
            disabled={!!initialBrand}
            onChange={(e) => {
              const brand =
                brands.find(
                  (b) => b.id === Number(e.target.value)
                ) || null;

              setSelectedBrand(brand);
              setSelectedSeries(null);
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
              {initialBrand
                ? "Brand (from product)"
                : "Select Brand"}
            </option>

            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>


        {/* CATEGORY */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>

          <select
            value={selectedCategory?.id ?? ""}
            onChange={(e) => {
              const category =
                categories.find(
                  (c) => c.id === Number(e.target.value)
                ) || null;

              setSelectedCategory(category);
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
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>


        {/* PART NAME */}
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Part Number / Name <span className="text-red-500">*</span>
          </label>

          <input
            value={partName}
            onChange={(e) =>
              setPartName(e.target.value)
            }
            placeholder="Enter part number"
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
              placeholder:text-gray-400
              focus:border-gray-400
              focus:ring-2
              focus:ring-gray-200
            "
          />
        </div>


        {/* SERIES */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Series
          </label>

          <select
            value={selectedSeries?.id ?? ""}
            disabled={
              !selectedBrand ||
              availableSeries.length === 0
            }
            onChange={(e) => {
              const series =
                availableSeries.find(
                  (s) => s.id === Number(e.target.value)
                ) || null;

              setSelectedSeries(series);
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
                : availableSeries.length === 0
                  ? "No Series Available"
                  : "Select Series"}
            </option>

            {availableSeries.map((series) => (
              <option
                key={series.id}
                value={series.id}
              >
                {series.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </section>


    {/* =====================================================
        PRICING
    ===================================================== */}

    <section className="mt-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Pricing
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Set the base price for this part.
        </p>
      </div>

      <div className="max-w-sm">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Base Price
        </label>

        <div className="relative">
          <span
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-sm
              text-gray-400
            "
          >
            $
          </span>

          <input
            type="number"
            min="0"
            value={priceNew}
            onChange={(e) =>
              setPriceNew(e.target.value)
            }
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
    </section>


    {/* =====================================================
        DESCRIPTION
    ===================================================== */}

    <section className="mt-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Description
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Add useful information about this part.
        </p>
      </div>

      <textarea
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        placeholder="Enter part description..."
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
    </section>


    {/* =====================================================
        IMAGE
    ===================================================== */}

    <section className="mt-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Part Image
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Upload an image to help identify the part.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Image
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImageFile(
              e.target.files?.[0] || null
            )
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

        {isEditMode &&
          existingImageId &&
          !imageFile && (
            <p className="mt-2 text-sm text-gray-500">
              Existing image attached
            </p>
          )}
      </div>
    </section>


    {/* =====================================================
        ACTIONS
    ===================================================== */}

    <div className="
      mt-8
      border-t
      border-gray-200
      pt-5
      flex
      justify-end
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
          : isEditMode
            ? "Update Part"
            : "Create Part"}
      </button>

    </div>

  </div>
);
};

export default PartForm;

