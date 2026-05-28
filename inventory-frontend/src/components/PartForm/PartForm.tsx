import React, { useState } from "react";
import { Term } from "../../types";
import { TaxonomyService } from "../../services/taxonomyService";

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

type Props = {
    brands: Term[];
    categories: Term[];
    initialBrand?: Term | null;
    onCreated?: (part: Term & { category?: Term | null }) => void;
    onClose?: () => void;
};

const PartForm: React.FC<Props> = ({
    brands,
    categories,
    initialBrand = null,
    onCreated,
    onClose,
}) => {
    const [selectedBrand, setSelectedBrand] = useState<Term | null>(initialBrand);
    const [selectedCategory, setSelectedCategory] = useState<Term | null>(null);
    const [partName, setPartName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedBrand || !selectedCategory || !partName.trim()) {
            alert("Brand, category, and part name are required.");
            return;
        }

        try {
            setLoading(true);

            const res: PartResponse = await TaxonomyService.createPart({
                name: partName,
                brand_id: selectedBrand.id,
                category_id: selectedCategory.id,
            });

            // 🔥 NORMALIZE HERE (THIS IS THE FIX)
            const normalizedPart = {
                id: res.id,
                name: res.name,
                slug: res.slug,
                category: res.category
                    ? {
                        id: res.category.id,
                        name: res.category.name,
                        slug: res.category.slug,
                    }
                    : null,
            };

            onCreated?.(normalizedPart);

            setPartName("");
            setSelectedCategory(null);

            onClose?.();
        } catch (err) {
            console.error("Create part failed:", err);
            alert("Failed to create part.");
        } finally {
            setLoading(false);
        }
    };

    const isValid =
        selectedBrand && selectedCategory && partName.trim().length > 0;

    return (
        <div>
            <h2>Create Part</h2>

            {/* BRAND */}
            <div style={{ marginBottom: 12 }}>
                <label>Brand</label>

                <select
                    value={selectedBrand?.id ?? ""}
                    disabled={!!initialBrand}
                    onChange={(e) => {
                        const brand =
                            brands.find((b) => b.id === Number(e.target.value)) || null;

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
                            categories.find((c) => c.id === Number(e.target.value)) || null;
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

            {/* NAME */}
            <div style={{ marginBottom: 12 }}>
                <label>Part Number / Name</label>
                <input
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="Enter part number"
                />
            </div>

            <button onClick={handleSubmit} disabled={loading || !isValid}>
                {loading ? "Creating..." : "Create Part"}
            </button>
        </div>
    );
};

export default PartForm;