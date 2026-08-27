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

        setPartName(
            editingPart.name || ""
        );

        // -----------------------------------------------------
        // BRAND
        // -----------------------------------------------------

        if (editingPart.brand_id) {

            const brand =
                brands.find(
                    (b) =>
                        b.id ===
                        Number(editingPart.brand_id)
                ) || null;

            setSelectedBrand(brand);

        }

        // -----------------------------------------------------
        // CATEGORY
        // -----------------------------------------------------

        if (editingPart.category_id) {

            const category =
                categories.find(
                    (c) =>
                        c.id ===
                        Number(editingPart.category_id)
                ) || null;

            setSelectedCategory(category);

        }

        // -----------------------------------------------------
        // PRICE
        // -----------------------------------------------------

        setPriceNew(
            editingPart.base_price != null
                ? String(editingPart.base_price)
                : ""
        );

        // -----------------------------------------------------
        // DESCRIPTION
        // -----------------------------------------------------

        setDescription(
            editingPart.description || ""
        );

    }, [
        editingPart,
        brands,
        categories,
    ]);


    // =========================================================
    // LOAD SERIES FOR BRAND
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

                setAvailableSeries(
                    data || []
                );

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
    // PREFILL SERIES AFTER SERIES LIST LOADS
    // =========================================================

    useEffect(() => {

        if (
            !editingPart ||
            !editingPart.series_id ||
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
    // FORM VALIDATION
    // =========================================================

    const isValid =
        !!selectedBrand &&
        !!selectedCategory &&
        partName.trim().length > 0;


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async () => {

        if (!isValid) {

            alert(
                "Brand, category, and part name are required."
            );

            return;
        }

        try {

            setLoading(true);


            // -------------------------------------------------
            // IMAGE
            // -------------------------------------------------

            const imageId =
                imageFile
                    ? await uploadImage(imageFile)
                    : undefined;


            // -------------------------------------------------
            // PAYLOAD
            // -------------------------------------------------

            const payload = {

                name:
                    partName.trim(),

                brand_id:
                    selectedBrand!.id,

                category_id:
                    selectedCategory!.id,

                series_id:
                    selectedSeries?.id || 0,

                base_price:
                    priceNew,

                description:
                    description.trim(),

                image_id:
                    imageId,
            };


            console.log(
                "PART PAYLOAD:",
                payload
            );


            // -------------------------------------------------
            // CREATE / UPDATE
            // -------------------------------------------------

            if (isEditMode) {

                const res =
                    await TaxonomyService.updatePart(
                        editingPart!.id,
                        payload
                    );

                onUpdated?.(res);

            } else {

                const res: PartResponse =
                    await TaxonomyService.createPart(
                        payload
                    );

                onCreated?.(res);

            }


            // -------------------------------------------------
            // RESET
            // -------------------------------------------------

            setPartName("");
            setSelectedCategory(null);
            setSelectedSeries(null);
            setPriceNew("");
            setDescription("");
            setImageFile(null);

            clearEditing?.();

            onClose?.();


        } catch (err) {

            console.error(
                "Part save failed:",
                err
            );

            alert(
                "Failed to save part."
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


            {/* =================================================
                BRAND
            ================================================= */}

            <div style={{ marginBottom: 12 }}>

                <label>
                    Brand
                </label>

                <select
                    value={
                        selectedBrand?.id ?? ""
                    }
                    disabled={!!initialBrand}
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

                        // Brand changed,
                        // previous series is no longer valid.
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


            {/* =================================================
                CATEGORY
            ================================================= */}

            <div style={{ marginBottom: 12 }}>

                <label>
                    Category
                </label>

                <select
                    value={
                        selectedCategory?.id ?? ""
                    }
                    onChange={(e) => {

                        const category =
                            categories.find(
                                (c) =>
                                    c.id ===
                                    Number(
                                        e.target.value
                                    )
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


            {/* =================================================
                PART NAME
            ================================================= */}

            <div style={{ marginBottom: 12 }}>

                <label>
                    Part Number / Name
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


            {/* =================================================
                SERIES
            ================================================= */}

            <div style={{ marginBottom: 12 }}>

                <label>
                    Series
                </label>

                <select
                    value={
                        selectedSeries?.id ?? ""
                    }
                    disabled={
                        !selectedBrand ||
                        availableSeries.length === 0
                    }
                    onChange={(e) => {

                        const series =
                            availableSeries.find(
                                (s) =>
                                    s.id ===
                                    Number(
                                        e.target.value
                                    )
                            ) || null;

                        setSelectedSeries(
                            series
                        );

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


            {/* =================================================
                BASE PRICE
            ================================================= */}

            <div style={{ marginBottom: 12 }}>

                <label>
                    Base Price
                </label>

                <input
                    type="number"
                    value={priceNew}
                    onChange={(e) =>
                        setPriceNew(
                            e.target.value
                        )
                    }
                    placeholder="Enter base price"
                />

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

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


            {/* =================================================
                IMAGE
            ================================================= */}

            <div style={{ marginBottom: 12 }}>

                <label>
                    Part Image
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {

                        setImageFile(
                            e.target.files?.[0] ||
                            null
                        );

                    }}
                />

            </div>


            {/* =================================================
                ACTION
            ================================================= */}

            <button
                onClick={handleSubmit}
                disabled={
                    loading ||
                    !isValid
                }
            >

                {loading
                    ? "Saving..."
                    : isEditMode
                        ? "Update Part"
                        : "Create Part"}

            </button>


            {isEditMode && (

                <button
                    onClick={handleCancel}
                    style={{
                        marginLeft: 10
                    }}
                >
                    Cancel
                </button>

            )}

        </div>
    );
};

export default PartForm;