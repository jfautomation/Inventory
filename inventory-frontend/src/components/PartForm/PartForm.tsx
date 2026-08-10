import React, { useEffect, useState } from "react";
import { Term } from "../../types";
import { TaxonomyService } from "../../services/taxonomyService";
import { uploadImage } from "../../services/mediaService";


type PartResponse = {
    id: number;
    name: string;
    slug: string;
    brand_id: number;
    category_id: number;
    category?: {
        id: number;
        name: string;
        slug: string;
    } | null;
};

type Part = {
    id: number;
    name: string;
    category?: Term | null;
};

type Props = {
    brands: Term[];
    categories: Term[];

    initialBrand?: Term | null;

    // 🔥 NEW (EDIT MODE)
    editingPart?: Part | null;
    clearEditing?: () => void;

    onCreated?: (part: any) => void;
    onUpdated?: (part: any) => void;
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

    const [selectedBrand, setSelectedBrand] = useState<Term | null>(initialBrand);
    const [selectedCategory, setSelectedCategory] = useState<Term | null>(null);
    const [partName, setPartName] = useState("");
    const [selectedSeries, setSelectedSeries] = useState<Term | null>(null);
    const [priceNew, setPriceNew] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [availableSeries, setAvailableSeries] = useState<Term[]>([]);


    // =========================
    // 🔥 LOAD EDIT DATA
    // =========================
    useEffect(() => {
        if (!editingPart) return;

        setPartName(editingPart.name || "");

        if (editingPart.category) {
            const cat = categories.find(c => c.id === editingPart.category!.id);
            setSelectedCategory(cat || null);
        }
    }, [editingPart, categories]);

    const isEditMode = !!editingPart;

    const handleSubmit = async () => {
        if (!selectedBrand || !selectedCategory || !partName.trim()) {
            alert("Brand, category, and part name are required.");
            return;
        }

        try {
            setLoading(true);

            const imageId = imageFile
                ? await uploadImage(imageFile)
                : undefined;

            // =========================
            // CREATE vs UPDATE
            // =========================
            if (isEditMode) {
                const res = await TaxonomyService.updatePart(editingPart!.id, {
                    name: partName,
                    brand_id: selectedBrand.id,
                    category_id: selectedCategory.id,
                    image_id: imageId,
                });

                onUpdated?.(res);
                clearEditing?.();
            } else {
                const res: PartResponse = await TaxonomyService.createPart({
                    name: partName,
                    brand_id: selectedBrand.id,
                    category_id: selectedCategory.id,
                    image_id: imageId,
                });

                onCreated?.(res);
            }

            // =========================
            // RESET FORM
            // =========================
            setPartName("");
            setSelectedCategory(null);
            setImageFile(null);

            onClose?.();

        } catch (err) {
            console.error("Part save failed:", err);
            alert("Failed to save part.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
    console.log("=== SERIES DEBUG ===");
    console.log("selectedBrand:", selectedBrand);
    console.log("selectedBrand ID:", selectedBrand?.id);

    if (!selectedBrand) {
        console.log("No brand selected");
        setAvailableSeries([]);
        setSelectedSeries(null);
        return;
    }

    setAvailableSeries([]);
    setSelectedSeries(null);

    TaxonomyService.getSeriesByBrand(selectedBrand.id)
        .then((data) => {
            console.log("=== SERIES DATA RECEIVED BY FORM ===");
            console.log("data:", data);

            setAvailableSeries(data || []);
        })
        .catch((err) => {
            console.error("Failed loading series:", err);
            setAvailableSeries([]);
        });
}, [selectedBrand]);

    const isValid =
        selectedBrand && selectedCategory && partName.trim().length > 0;

    return (
        <div>
            <h2>{isEditMode ? "Edit Part" : "Create Part"}</h2>

            {/* BRAND */}
            <div style={{ marginBottom: 12 }}>
                <label>Brand</label>

                <select
                    value={selectedBrand?.id ?? ""}
                    disabled={!!initialBrand}
                    onChange={(e) => {
                        const brand =
                            brands.find(b => b.id === Number(e.target.value)) || null;
                        setSelectedBrand(brand);
                    }}
                >
                    <option value="">
                        {initialBrand ? "Brand (from product)" : "Select Brand"}
                    </option>

                    {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* CATEGORY */}
            <div style={{ marginBottom: 12 }}>
                <label>Category</label>

                <select
                    value={selectedCategory?.id ?? ""}
                    onChange={(e) => {
                        const cat =
                            categories.find(c => c.id === Number(e.target.value)) || null;
                        setSelectedCategory(cat);
                    }}
                >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* IMAGE */}
            <div style={{ marginBottom: 12 }}>
                <label>Part Image</label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setImageFile(e.target.files?.[0] || null);
                    }}
                />
            </div>

            {/* NAME */}
            <div style={{ marginBottom: 12 }}>
                <label>Part Number / Name</label>

                <input
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="Enter part number"
                />
            </div>

            {/* SERIES */}
            <div style={{ marginBottom: 12 }}>
                <label>Series</label>

                {!selectedBrand ? (
                    <select disabled>
                        <option>Select a brand first</option>
                    </select>
                ) : availableSeries.length === 0 ? (
                    <select disabled>
                        <option>No series available</option>
                    </select>
                ) : (
                    <select
                        value={selectedSeries?.id ?? ""}
                        onChange={(e) => {
                            const series =
                                availableSeries.find(
                                    (s) => s.id === Number(e.target.value)
                                ) || null;

                            setSelectedSeries(series);
                        }}
                    >
                        <option value="">Select Series</option>

                        {availableSeries.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>


            {/* BASE PRICE */}
            <div style={{ marginBottom: 12 }}>
                <label>Base Price</label>

                <input
                    type="number"
                    value={priceNew}
                    onChange={(e) => setPriceNew(e.target.value)}
                    placeholder="Enter base price"
                />
            </div>


            {/* DESCRIPTION */}
            <div style={{ marginBottom: 12 }}>
                <label>Description</label>

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter part description"
                    rows={4}
                />
            </div>

            {/* ACTIONS */}
            <button onClick={handleSubmit} disabled={loading || !isValid}>
                {loading
                    ? "Saving..."
                    : isEditMode
                        ? "Update Part"
                        : "Create Part"}
            </button>

            {isEditMode && (
                <button
                    onClick={() => clearEditing?.()}
                    style={{ marginLeft: 10 }}
                >
                    Cancel
                </button>
            )}
        </div>
    );
};

export default PartForm;