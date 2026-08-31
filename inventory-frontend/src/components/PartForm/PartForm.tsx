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

  return (
    <div>

      <h2>
        {isEditMode
          ? "Edit Part"
          : "Create Part"}
      </h2>


      {/* =====================================================
          BRAND
      ===================================================== */}

      <div style={{ marginBottom: 12 }}>

        <label>
          Brand *
        </label>

        <select
          value={selectedBrand?.id ?? ""}
          disabled={!!initialBrand}
          onChange={(e) => {

            const brand =
              brands.find(
                (b) =>
                  b.id ===
                  Number(e.target.value)
              ) || null;

            setSelectedBrand(brand);
            setSelectedSeries(null);
          }}
        >

          <option value="">
            {initialBrand
              ? "Brand (from product)"
              : "Select Brand"}
          </option>

          {brands.map((brand) => (
            <option
              key={brand.id}
              value={brand.id}
            >
              {brand.name}
            </option>
          ))}

        </select>

      </div>


      {/* =====================================================
          CATEGORY
      ===================================================== */}

      <div style={{ marginBottom: 12 }}>

        <label>
          Category *
        </label>

        <select
          value={selectedCategory?.id ?? ""}
          onChange={(e) => {

            const category =
              categories.find(
                (c) =>
                  c.id ===
                  Number(e.target.value)
              ) || null;

            setSelectedCategory(
              category
            );
          }}
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


      {/* =====================================================
          PART NAME
      ===================================================== */}

      <div style={{ marginBottom: 12 }}>

        <label>
          Part Number / Name *
        </label>

        <input
          value={partName}
          onChange={(e) =>
            setPartName(
              e.target.value
            )
          }
          placeholder="Enter part number"
        />

      </div>


      {/* =====================================================
          SERIES
      ===================================================== */}

      <div style={{ marginBottom: 12 }}>

        <label>
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
                (s) =>
                  s.id ===
                  Number(e.target.value)
              ) || null;

            setSelectedSeries(series);
          }}
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


      {/* =====================================================
          BASE PRICE
      ===================================================== */}

      <div style={{ marginBottom: 12 }}>

        <label>
          Base Price
        </label>

        <input
          type="number"
          min="0"
          value={priceNew}
          onChange={(e) =>
            setPriceNew(
              e.target.value
            )
          }
          placeholder="Enter base price"
        />

      </div>


      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <div style={{ marginBottom: 12 }}>

        <label>
          Description
        </label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          placeholder="Enter part description"
          rows={4}
        />

      </div>


      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div style={{ marginBottom: 12 }}>

        <label>
          Part Image
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

        {isEditMode &&
          existingImageId &&
          !imageFile && (
            <div style={{ marginTop: 6 }}>
              Existing image attached
            </div>
          )}

      </div>


      {/* =====================================================
          ACTION
      ===================================================== */}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
      >

        {loading
          ? "Saving..."
          : isEditMode
            ? "Update Part"
            : "Create Part"}

      </button>


      {/* =====================================================
          CANCEL
      ===================================================== */}

      {isEditMode && (
        <button
          type="button"
          onClick={handleCancel}
          style={{
            marginLeft: 10,
          }}
        >
          Cancel
        </button>
      )}

    </div>
  );
};

export default PartForm;

