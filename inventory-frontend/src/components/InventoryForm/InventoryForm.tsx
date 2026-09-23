import React, { useEffect, useState } from "react";
import { ProductService } from "../../services/productService";
import { TaxonomyService } from "../../services/taxonomyService";
import { uploadImage } from "../../services/mediaService";
import type {
    Product,
    ProductPayload,
    Part,
    Term,
    CreatePartPayload,
} from "../../types";
import { normalizeProduct } from "../../utils/normalizeProduct";
import { useInventory } from "../../context/InventoryContext";

type InventoryFormEntity = "product" | "part";

type InventoryFormProps = {
    entity: InventoryFormEntity;

    brands: Term[];

    conditions?: Term[];
    shelves?: Term[];
    categories?: Term[];
    series?: Term[];

    editingProduct?: Product | null;
    editingPart?: Part | null;

    initialBrand?: Term | null;

    onCreated?: (item: Product | Part) => void;
    onUpdated?: (item: Product | Part) => void;

    clearEditing?: () => void;
    onClose?: () => void;
};

const InventoryForm: React.FC<InventoryFormProps> = ({
    entity,
    brands,
    conditions = [],
    shelves = [],
    categories = [],
    editingProduct = null,
    editingPart = null,
    initialBrand = null,
    onCreated,
    onUpdated,
    clearEditing,
    onClose,
}) => {
    // =========================================================
    // GLOBAL INVENTORY DATA
    // =========================================================

    const { parts: allParts } = useInventory();

    // =========================================================
    // MODE
    // =========================================================

    const isProduct = entity === "product";
    const isPart = entity === "part";

    const isEditing = isProduct
        ? !!editingProduct
        : !!editingPart;

    // =========================================================
    // COMMON STATE
    // =========================================================

    const [selectedBrand, setSelectedBrand] =
        useState<Term | null>(initialBrand);

    const [imageFile, setImageFile] =
        useState<File | null>(null);

    const [existingImageRemoved, setExistingImageRemoved] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    // =========================================================
    // PRODUCT STATE
    // =========================================================

    const [inventoryStatus, setInventoryStatus] =
        useState<"active" | "sold" | "archived">("active");

    const [title, setTitle] =
        useState("");

    const [serialNumber, setSerialNumber] =
        useState("");

    const [workOrder, setWorkOrder] =
        useState("");

    const [listPrice, setListPrice] =
        useState("");

    const [priceMode, setPriceMode] =
        useState<"automatic" | "manual">("automatic");

    const [notes, setNotes] =
        useState("");

    const [testStatus, setTestStatus] =
        useState<boolean | null>(null);

    const [testDate, setTestDate] =
        useState("");

    const [selectedCondition, setSelectedCondition] =
        useState<Term | null>(null);

    const [selectedShelf, setSelectedShelf] =
        useState<Term | null>(null);

    const [selectedProductPart, setSelectedProductPart] =
        useState<Part | null>(null);

    // =========================================================
    // PART STATE
    // =========================================================

    const [partName, setPartName] =
        useState("");

    const [partNumber, setPartNumber] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState<Term | null>(null);

    const [selectedSeries, setSelectedSeries] =
        useState<Term | null>(null);

    const [priceNew, setPriceNew] =
        useState("");

    const [shortDescription, setShortDescription] =
        useState("");

    const [longDescription, setLongDescription] =
        useState("");

    const [availableSeries, setAvailableSeries] =
        useState<Term[]>([]);

    const [additionalImageFiles, setAdditionalImageFiles] =
        useState<File[]>([]);

    const [existingAdditionalImageIds, setExistingAdditionalImageIds] =
        useState<number[]>([]);

    const [productAdditionalImageFiles, setProductAdditionalImageFiles] =
        useState<File[]>([]);

    const [existingProductAdditionalImageIds, setExistingProductAdditionalImageIds] =
        useState<number[]>([]);

    // =========================================================
    // PRODUCT PARTS FILTERED BY BRAND
    // =========================================================

    const productParts = selectedBrand
        ? allParts.filter(
            (part) =>
                Number(part.brand_id) ===
                Number(selectedBrand.id)
        )
        : [];

    // =========================================================
    // PRODUCT AUTOMATIC PRICE
    // =========================================================

    const automaticPrice =
        selectedProductPart?.base_price != null &&
            selectedCondition?.price_percentage != null
            ? selectedProductPart.base_price *
            (selectedCondition.price_percentage / 100)
            : null;

    // =========================================================
    // EDIT MODE — PRODUCT
    // =========================================================

    useEffect(() => {
        if (!isProduct || !editingProduct) {
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

        setPriceMode(
            editingProduct.price_mode === "manual"
                ? "manual"
                : "automatic"
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

        setImageFile(null);
        setExistingImageRemoved(false);
        setExistingProductAdditionalImageIds(
            editingProduct.additional_image_ids || []
        );
        setProductAdditionalImageFiles([]);

    }, [isProduct, editingProduct]);

    // =========================================================
    // EDIT MODE — PRODUCT PART
    // =========================================================

    useEffect(() => {
        if (!isProduct || !editingProduct) {
            if (isProduct && !editingProduct) {
                setSelectedProductPart(null);
            }

            return;
        }

        const productPartId =
            editingProduct.part?.[0]?.id;

        if (!productPartId) {
            setSelectedProductPart(null);
            return;
        }

        const fullPart = allParts.find(
            (part) =>
                Number(part.id) ===
                Number(productPartId)
        );

        setSelectedProductPart(
            fullPart || null
        );
    }, [
        isProduct,
        editingProduct,
        allParts,
    ]);

    // =========================================================
    // EDIT MODE — PART
    // =========================================================

    useEffect(() => {
        if (!isPart || !editingPart) {
            return;
        }

        setPartName(
            editingPart.name || ""
        );

        setPartNumber(
            editingPart.part_number || ""
        );

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

        setSelectedSeries(null);

        setPriceNew(
            editingPart.base_price != null
                ? String(editingPart.base_price)
                : ""
        );

        setShortDescription(
            editingPart.short_description || ""
        );

        setLongDescription(
            editingPart.long_description || ""
        );

        setImageFile(null);
        setExistingImageRemoved(false);

        setExistingAdditionalImageIds(
            editingPart.additional_image_ids || []
        );

        setAdditionalImageFiles([]);
    }, [
        isPart,
        editingPart,
        brands,
        categories,
    ]);

    // =========================================================
    // LOAD SERIES FOR PART BRAND
    // =========================================================

    useEffect(() => {
        if (!isPart || !selectedBrand) {
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
    }, [
        isPart,
        selectedBrand,
    ]);

    // =========================================================
    // PREFILL PART SERIES
    // =========================================================

    useEffect(() => {
        if (
            !isPart ||
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
        isPart,
        editingPart,
        availableSeries,
    ]);

    // =========================================================
    // CLEAR PRODUCT PART WHEN BRAND CHANGES
    // =========================================================

    useEffect(() => {
        if (
            !isProduct ||
            !selectedBrand ||
            !selectedProductPart
        ) {
            return;
        }

        if (
            Number(selectedProductPart.brand_id) !==
            Number(selectedBrand.id)
        ) {
            setSelectedProductPart(null);
        }
    }, [
        isProduct,
        selectedBrand,
        selectedProductPart,
    ]);

    // =========================================================
    // REQUIRED FIELD VALIDATION
    // =========================================================

    const missingFields: string[] = [];

    if (isProduct) {
        if (!selectedBrand) {
            missingFields.push("Brand");
        }

        if (!selectedProductPart) {
            missingFields.push("Part Number");
        }

        if (!serialNumber.trim()) {
            missingFields.push("Serial Number");
        }

        if (!selectedCondition) {
            missingFields.push("Condition");
        }
    }

    if (isPart) {
        if (!selectedBrand) {
            missingFields.push("Brand");
        }

        if (!selectedCategory) {
            missingFields.push("Category");
        }

        if (!partNumber.trim()) {
            missingFields.push("Part Number");
        }

        if (!partName.trim()) {
            missingFields.push("Part Name");
        }
    }

    const hasRequiredFields =
        missingFields.length === 0;

    // =========================================================
    // PRIMARY IMAGE
    // =========================================================

    const handlePrimaryImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            e.target.files?.[0] || null;

        setImageFile(file);

        if (file) {
            setExistingImageRemoved(false);
        }

        e.target.value = "";
    };

    const handleRemoveExistingImage = () => {
        setExistingImageRemoved(true);
        setImageFile(null);
    };

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

            // =====================================================
            // PRODUCT
            // =====================================================

            if (isProduct) {
                const imageId = imageFile
                    ? await uploadImage(imageFile)
                    : isEditing && existingImageRemoved
                        ? null
                        : editingProduct?.image_id;

                const newProductAdditionalImageIds =
                    productAdditionalImageFiles.length > 0
                        ? await Promise.all(
                            productAdditionalImageFiles.map(
                                (file) => uploadImage(file)
                            )
                        )
                        : [];

                const productAdditionalImageIds = [
                    ...existingProductAdditionalImageIds,
                    ...newProductAdditionalImageIds,
                ];

                const payload: ProductPayload = {
                    title: title.trim(),

                    serial_number:
                        serialNumber.trim(),

                    price_mode: priceMode,

                    ...(priceMode === "manual" &&
                        listPrice.trim()
                        ? {
                            list_price:
                                Number(listPrice),
                        }
                        : {}),

                    part: [
                        selectedProductPart!.id,
                    ],

                    condition: [
                        selectedCondition!.id,
                    ],

                    status: "publish",

                    additional_image_ids:
                        productAdditionalImageIds,

                    ...(workOrder.trim()
                        ? {
                            work_order:
                                workOrder.trim(),
                        }
                        : {}),

                    ...(notes.trim()
                        ? {
                            notes:
                                notes.trim(),
                        }
                        : {}),

                    ...(selectedShelf
                        ? {
                            shelf: [
                                selectedShelf.id,
                            ],
                        }
                        : {}),

                    ...(testStatus !== null
                        ? {
                            test_status:
                                testStatus,
                        }
                        : {}),

                    ...(testDate.trim()
                        ? {
                            test_date:
                                testDate,
                        }
                        : {}),

                    ...(inventoryStatus
                        ? {
                            inventory_status:
                                inventoryStatus,
                        }
                        : {}),

                    ...(imageId !== undefined
                        ? {
                            image_id: imageId,
                        }

                        : {}),
                };

                const response = isEditing
                    ? await ProductService.update(
                        editingProduct!.id,
                        payload
                    )
                    : await ProductService.create(
                        payload
                    );

                const normalized =
                    normalizeProduct(response);

                if (isEditing) {
                    onUpdated?.(normalized);
                } else {
                    onCreated?.(normalized);
                }

                setProductAdditionalImageFiles([]);
                setExistingProductAdditionalImageIds([]);

                return;
            }

            // =====================================================
            // PART
            // =====================================================

            let newImageId: number | null = null;

            if (imageFile) {
                newImageId =
                    await uploadImage(imageFile);
            }

            const newAdditionalImageIds =
                additionalImageFiles.length > 0
                    ? await Promise.all(
                        additionalImageFiles.map(
                            (file) =>
                                uploadImage(file)
                        )
                    )
                    : [];

            const additionalImageIds = [
                ...existingAdditionalImageIds,
                ...newAdditionalImageIds,
            ];

            const payload: CreatePartPayload = {
                name: partName.trim(),
                part_number: partNumber.trim(),
                brand_id: selectedBrand!.id,
                category_id: selectedCategory!.id,
                series_id: selectedSeries?.id ?? null,
                base_price:
                    priceNew === "" ? null : Number(priceNew),
                short_description: shortDescription.trim(),
                long_description: longDescription.trim(),
                image_id: undefined,
                additional_image_ids: additionalImageIds,
            };

            if (newImageId !== null) {
                payload.image_id = newImageId;
            } else if (isEditing && existingImageRemoved) {
                payload.image_id = null;
            }

            const response = isEditing
                ? await TaxonomyService.updatePart(
                    editingPart!.id,
                    payload
                )
                : await TaxonomyService.createPart(
                    payload
                );

            if (isEditing) {
                onUpdated?.(response);
            } else {
                onCreated?.(response);
            }

            // =====================================================
            // RESET PART STATE
            // =====================================================
            // =====================================================
            // RESET PART STATE
            // =====================================================

            setPartName("");
            setPartNumber("");
            setSelectedBrand(initialBrand);
            setSelectedCategory(null);
            setSelectedSeries(null);
            setPriceNew("");
            setShortDescription("");
            setLongDescription("");

            setImageFile(null);
            setExistingImageRemoved(false);

            setAdditionalImageFiles([]);
            setExistingAdditionalImageIds([]);

            clearEditing?.();

        } catch (err: any) {
            console.error(
                "Inventory form save failed:",
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
                    "Failed to save."
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
    // TEMPORARY UI
    // =========================================================

    return (
        <div className="w-full max-w-4xl">
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {isEditing
                        ? `Edit ${isProduct ? "Product" : "Part"}`
                        : `Create ${isProduct ? "Product" : "Part"}`}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {isEditing
                        ? `Update the ${isProduct ? "product" : "part"} information below.`
                        : `Add a new ${isProduct ? "product" : "part"} to your inventory.`}
                </p>
            </div>

            {isPart && (
                <>
                    {/* ================================================ */}
                    {/* BASIC INFORMATION */}
                    {/* ================================================ */}

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
                            {/* Brand */}

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
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

                            {/* Category */}

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Select Category</option>

                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Part Number */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Part Number <span className="text-red-500">*</span>
                                </label>

                                <input
                                    value={partNumber}
                                    onChange={(e) => setPartNumber(e.target.value)}
                                    placeholder="Enter part number"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>

                            {/* Part Name */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Part Name <span className="text-red-500">*</span>
                                </label>

                                <input
                                    value={partName}
                                    onChange={(e) => setPartName(e.target.value)}
                                    placeholder="Enter part name"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>

                            {/* Series */}

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">
                                        {!selectedBrand
                                            ? "Select Brand First"
                                            : availableSeries.length === 0
                                                ? "No Series Available"
                                                : "Select Series"}
                                    </option>

                                    {availableSeries.map((series) => (
                                        <option key={series.id} value={series.id}>
                                            {series.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* PRICING */}
                    {/* ================================================ */}

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
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                    $
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    value={priceNew}
                                    onChange={(e) => setPriceNew(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* DESCRIPTIONS */}
                    {/* ================================================ */}

                    <section className="mt-6">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Descriptions
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add short and detailed information about this part.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Short Description */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Short Description
                                </label>

                                <textarea
                                    value={shortDescription}
                                    onChange={(e) =>
                                        setShortDescription(e.target.value)
                                    }
                                    placeholder="Enter a short part description..."
                                    rows={3}
                                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>

                            {/* Long Description */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Long Description
                                </label>

                                <textarea
                                    value={longDescription}
                                    onChange={(e) =>
                                        setLongDescription(e.target.value)
                                    }
                                    placeholder="Enter detailed part information..."
                                    rows={6}
                                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* PART IMAGE */}
                    {/* ================================================ */}

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
                                onChange={handlePrimaryImageChange}
                                className="block w-fit max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
                            />

                            {/* Existing image */}

                            {isEditing &&
                                !existingImageRemoved &&
                                !imageFile &&
                                editingPart?.image_url && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm font-medium text-gray-700">
                                            Current Image
                                        </p>

                                        <div className="h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            <img
                                                src={editingPart.image_url}
                                                alt={editingPart.name}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleRemoveExistingImage}
                                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}

                            {/* Removed existing image */}

                            {isEditing &&
                                existingImageRemoved &&
                                !imageFile && (
                                    <div className="mt-4 flex h-32 w-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-400">
                                        No Image
                                    </div>
                                )}

                            {/* New image preview */}

                            {imageFile && (
                                <div className="mt-4">
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        New Image
                                    </p>

                                    <div className="h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                        <img
                                            src={URL.createObjectURL(imageFile)}
                                            alt="New part image preview"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                        }}
                                        className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* ADDITIONAL IMAGES */}
                    {/* ================================================ */}

                    <section className="mt-6">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Additional Images
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Upload additional images for this part.
                            </p>
                        </div>

                        <div>
                            <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                + Add Images

                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = Array.from(
                                            e.target.files || []
                                        );

                                        setAdditionalImageFiles((current) => [
                                            ...current,
                                            ...files,
                                        ]);

                                        e.target.value = "";
                                    }}
                                />
                            </label>

                            {/* Existing additional images */}

                            {isEditing &&
                                editingPart?.additional_image_urls &&
                                editingPart.additional_image_urls.length > 0 && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm font-medium text-gray-700">
                                            Existing Images
                                        </p>

                                        <div className="flex flex-wrap gap-4">
                                            {editingPart.additional_image_urls.map(
                                                (url, index) => {
                                                    const imageId =
                                                        editingPart.additional_image_ids?.[
                                                        index
                                                        ];

                                                    if (
                                                        !imageId ||
                                                        !existingAdditionalImageIds.includes(
                                                            imageId
                                                        )
                                                    ) {
                                                        return null;
                                                    }

                                                    return (
                                                        <div
                                                            key={imageId}
                                                            className="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`${editingPart.name} additional image ${index + 1}`}
                                                                className="h-full w-full object-contain"
                                                            />

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setExistingAdditionalImageIds(
                                                                        (current) =>
                                                                            current.filter(
                                                                                (id) => id !== imageId
                                                                            )
                                                                    );
                                                                }}
                                                                className="absolute bottom-2 left-2 right-2 rounded-md bg-black/70 px-2 py-1.5 text-xs font-medium text-white hover:bg-black/90"
                                                            >
                                                                Remove Image
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* New additional images */}

                            {additionalImageFiles.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        New Images
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        {additionalImageFiles.map(
                                            (file, index) => (
                                                <div
                                                    key={`${file.name}-${index}`}
                                                    className="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`New additional image ${index + 1}`}
                                                        className="h-full w-full object-contain"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAdditionalImageFiles(
                                                                (current) =>
                                                                    current.filter(
                                                                        (_, i) => i !== index
                                                                    )
                                                            );
                                                        }}
                                                        className="absolute bottom-2 left-2 right-2 rounded-md bg-black/70 px-2 py-1.5 text-xs font-medium text-white hover:bg-black/90"
                                                    >
                                                        Remove Image
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm text-gray-500">
                                        {additionalImageFiles.length} additional
                                        image
                                        {additionalImageFiles.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                        selected
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* SAVE */}
                    {/* ================================================ */}

                    <div className="mt-8 flex justify-end border-t border-gray-200 pt-5">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Saving..."
                                : isEditing
                                    ? "Update Part"
                                    : "Create Part"}
                        </button>
                    </div>
                </>
            )}

            {isProduct && (
                <>
                    {/* ================================================ */}
                    {/* BASIC INFORMATION */}
                    {/* ================================================ */}

                    <section>
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Basic Information
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Identify the product and assign its part information.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Title */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Title
                                </label>

                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter product title"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>

                            {/* Brand */}

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
                                        setSelectedProductPart(null);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Select Brand</option>

                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Part Number */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Part Number <span className="text-red-500">*</span>
                                </label>

                                <select
                                    value={selectedProductPart?.id ?? ""}
                                    disabled={!selectedBrand}
                                    onChange={(e) => {
                                        const part =
                                            productParts.find(
                                                (item) => item.id === Number(e.target.value)
                                            ) || null;

                                        setSelectedProductPart(part);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">
                                        {!selectedBrand
                                            ? "Select Brand First"
                                            : productParts.length === 0
                                                ? "No Parts Available"
                                                : "Select Part Number"}
                                    </option>

                                    {productParts.map((part) => (
                                        <option key={part.id} value={part.id}>
                                            {part.part_number || part.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Serial Number */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Serial Number <span className="text-red-500">*</span>
                                </label>

                                <input
                                    value={serialNumber}
                                    onChange={(e) => setSerialNumber(e.target.value)}
                                    placeholder="Enter serial number"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>

                            {/* Work Order */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Work Order
                                </label>

                                <input
                                    value={workOrder}
                                    onChange={(e) => setWorkOrder(e.target.value)}
                                    placeholder="Enter work order"
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* INVENTORY INFORMATION */}
                    {/* ================================================ */}

                    <section className="mt-6">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Inventory Information
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage the product's inventory status, condition, shelf,
                                and pricing.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Status */}

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
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="active">Active</option>
                                    <option value="sold">Sold</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            {/* Condition */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Condition <span className="text-red-500">*</span>
                                </label>

                                <select
                                    value={selectedCondition?.id ?? ""}
                                    onChange={(e) => {
                                        const condition =
                                            conditions.find(
                                                (item) =>
                                                    item.id === Number(e.target.value)
                                            ) || null;

                                        setSelectedCondition(condition);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Select Condition</option>

                                    {conditions.map((condition) => (
                                        <option
                                            key={condition.id}
                                            value={condition.id}
                                        >
                                            {condition.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Shelf */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Shelf
                                </label>

                                <select
                                    value={selectedShelf?.id ?? ""}
                                    onChange={(e) => {
                                        const shelf =
                                            shelves.find(
                                                (item) =>
                                                    item.id === Number(e.target.value)
                                            ) || null;

                                        setSelectedShelf(shelf);
                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Select Shelf</option>

                                    {shelves.map((shelf) => (
                                        <option
                                            key={shelf.id}
                                            value={shelf.id}
                                        >
                                            {shelf.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Mode */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Pricing
                                </label>

                                <select
                                    value={priceMode}
                                    onChange={(e) =>
                                        setPriceMode(
                                            e.target.value as
                                            | "automatic"
                                            | "manual"
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="automatic">
                                        Automatic
                                    </option>

                                    <option value="manual">
                                        Manual
                                    </option>
                                </select>
                            </div>

                            {/* Price */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    List Price
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                        $
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            priceMode === "automatic" &&
                                                automaticPrice != null
                                                ? automaticPrice
                                                : listPrice
                                        }
                                        disabled={priceMode === "automatic"}
                                        onChange={(e) =>
                                            setListPrice(e.target.value)
                                        }
                                        placeholder="0.00"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>

                                {priceMode === "automatic" &&
                                    automaticPrice != null && (
                                        <p className="mt-1.5 text-xs text-gray-500">
                                            Calculated from the selected part and
                                            condition.
                                        </p>
                                    )}
                            </div>
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* TESTING */}
                    {/* ================================================ */}

                    <section className="mt-6">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Testing
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Record the testing status and test date.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {/* Test Status */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Test Status
                                </label>

                                <select
                                    value={
                                        testStatus === null
                                            ? ""
                                            : testStatus
                                                ? "passed"
                                                : "failed"
                                    }
                                    onChange={(e) => {
                                        if (e.target.value === "") {
                                            setTestStatus(null);
                                        } else {
                                            setTestStatus(
                                                e.target.value === "passed"
                                            );
                                        }
                                    }}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                >
                                    <option value="">Not Tested</option>
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            {/* Test Date */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Test Date
                                </label>

                                <input
                                    type="date"
                                    value={testDate}
                                    onChange={(e) => setTestDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* ADDITIONAL INFORMATION */}
                    {/* ================================================ */}

                    <section className="mt-6">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Additional Information
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Add notes and product images.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Notes */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Notes
                                </label>

                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter notes..."
                                    rows={4}
                                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                                />
                            </div>

                            {/* Image */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Product Image
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePrimaryImageChange}
                                    className="block w-fit max-w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
                                />

                                {/* Existing image */}

                                {isEditing &&
                                    !existingImageRemoved &&
                                    !imageFile &&
                                    editingProduct?.image && (
                                        <div className="mt-4">
                                            <p className="mb-2 text-sm font-medium text-gray-700">
                                                Current Image
                                            </p>

                                            <div className="h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                <img
                                                    src={editingProduct.image}
                                                    alt={editingProduct.title}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRemoveExistingImage}
                                                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    )}

                                {/* Removed existing image */}

                                {isEditing &&
                                    existingImageRemoved &&
                                    !imageFile && (
                                        <div className="mt-4 flex h-32 w-32 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-400">
                                            No Image
                                        </div>
                                    )}

                                {/* New image */}

                                {imageFile && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm font-medium text-gray-700">
                                            New Image
                                        </p>

                                        <div className="h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            <img
                                                src={URL.createObjectURL(imageFile)}
                                                alt="New product image preview"
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                            }}
                                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                )}
                            </div>
                            {/* Additional Images */}

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Additional Images
                                </label>

                                <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                    + Add Images

                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(
                                                e.target.files || []
                                            );

                                            setProductAdditionalImageFiles(
                                                (current) => [
                                                    ...current,
                                                    ...files,
                                                ]
                                            );

                                            e.target.value = "";
                                        }}
                                    />
                                </label>

                                {/* Existing additional images */}

                                {isEditing &&
                                    editingProduct?.additional_image_urls &&
                                    editingProduct.additional_image_urls.length > 0 && (
                                        <div className="mt-4">
                                            <p className="mb-2 text-sm font-medium text-gray-700">
                                                Existing Images
                                            </p>

                                            <div className="flex flex-wrap gap-4">
                                                {editingProduct.additional_image_urls.map(
                                                    (url, index) => {
                                                        const imageId =
                                                            editingProduct.additional_image_ids?.[
                                                            index
                                                            ];

                                                        if (
                                                            !imageId ||
                                                            !existingProductAdditionalImageIds.includes(
                                                                imageId
                                                            )
                                                        ) {
                                                            return null;
                                                        }

                                                        return (
                                                            <div
                                                                key={imageId}
                                                                className="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                                            >
                                                                <img
                                                                    src={url}
                                                                    alt={`${editingProduct.title} additional image ${index + 1}`}
                                                                    className="h-full w-full object-contain"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setExistingProductAdditionalImageIds(
                                                                            (current) =>
                                                                                current.filter(
                                                                                    (id) =>
                                                                                        id !==
                                                                                        imageId
                                                                                )
                                                                        );
                                                                    }}
                                                                    className="absolute bottom-2 left-2 right-2 rounded-md bg-black/70 px-2 py-1.5 text-xs font-medium text-white hover:bg-black/90"
                                                                >
                                                                    Remove Image
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* New additional images */}

                                {productAdditionalImageFiles.length > 0 && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm font-medium text-gray-700">
                                            New Images
                                        </p>

                                        <div className="flex flex-wrap gap-4">
                                            {productAdditionalImageFiles.map(
                                                (file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className="relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                                    >
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`New product additional image ${index + 1}`}
                                                            className="h-full w-full object-contain"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setProductAdditionalImageFiles(
                                                                    (current) =>
                                                                        current.filter(
                                                                            (_, i) =>
                                                                                i !== index
                                                                        )
                                                                );
                                                            }}
                                                            className="absolute bottom-2 left-2 right-2 rounded-md bg-black/70 px-2 py-1.5 text-xs font-medium text-white hover:bg-black/90"
                                                        >
                                                            Remove Image
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        <p className="mt-2 text-sm text-gray-500">
                                            {productAdditionalImageFiles.length} additional
                                            image
                                            {productAdditionalImageFiles.length !== 1
                                                ? "s"
                                                : ""}{" "}
                                            selected
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ================================================ */}
                    {/* SAVE */}
                    {/* ================================================ */}

                    <div className="mt-8 flex justify-end border-t border-gray-200 pt-5">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Saving..."
                                : isEditing
                                    ? "Update Product"
                                    : "Create Product"}
                        </button>
                    </div>
                </>
            )}

            {/* {isProduct && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
                    <p className="text-sm text-gray-600">
                        Product form will be added next.
                    </p>
                </div>
            )} */}
        </div>
    );
};

export default InventoryForm;