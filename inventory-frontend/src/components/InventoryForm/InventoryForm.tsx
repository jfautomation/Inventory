
import React, { useEffect, useMemo, useState } from "react";

import { ProductService } from "../../services/productService";
import { ProductListingService } from "../../services/productListingService";
import { TaxonomyService } from "../../services/taxonomyService";
import { uploadImage } from "../../services/mediaService";

import type {
    Product,
    ProductPayload,
    Part,
    Term,
    CreatePartPayload,
    ProductListing,
    ProductListingPayload,
} from "../../types";

import { normalizeProduct } from "../../utils/normalizeProduct";
import { useInventory } from "../../context/InventoryContext";

type InventoryFormEntity = "product" | "part" | "listing";

type InventoryFormProps = {
    entity: InventoryFormEntity;
    brands: Term[];
    conditions?: Term[];
    shelves?: Term[];
    categories?: Term[];
    series?: Term[];
    editingProduct?: Product | null;
    editingPart?: Part | null;
    editingListing?: ProductListing | null;
    initialListingId?: number | null;
    initialBrand?: Term | null;
    onCreated?: (item: Product | Part | ProductListing) => void;
    onUpdated?: (item: Product | Part | ProductListing) => void;
    clearEditing?: () => void;
    onClose?: () => void;
};

const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

const sectionClass = "mt-7 border-t border-gray-200 pt-6";

const buttonClass =
    "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

const fileInputClass =
    "block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700";

const InventoryForm: React.FC<InventoryFormProps> = ({
    entity,
    brands,
    conditions = [],
    shelves = [],
    categories = [],
    initialBrand = null,
    editingProduct = null,
    editingPart = null,
    editingListing = null,
    initialListingId = null,
    onCreated,
    onUpdated,
    clearEditing,
    onClose,
}) => {
    const {
        parts: allParts,
        productListings,
        fetchBootstrap,
    } = useInventory();

    const isProduct = entity === "product";
    const isPart = entity === "part";
    const isListing = entity === "listing";

    const isProductEditing = isProduct && !!editingProduct;
    const isPartEditing = isPart && !!editingPart;
    const isListingEditing = isListing && !!editingListing;

    const isEditing =
        isProductEditing || isPartEditing || isListingEditing;

    // ============================================================
    // GENERAL STATE
    // ============================================================

    const [loading, setLoading] = useState(false);

    // ============================================================
    // SERIALIZED PRODUCT STATE
    // ============================================================

    const [selectedPartId, setSelectedPartId] = useState<number | "">("");
    const [selectedListingId, setSelectedListingId] = useState<number | "">("");

    const [serialNumber, setSerialNumber] = useState("");
    const [workOrder, setWorkOrder] = useState("");
    const [inventoryStatus, setInventoryStatus] =
        useState<"active" | "sold" | "archived">("active");

    const [selectedShelf, setSelectedShelf] = useState<Term | null>(null);
    const [testStatus, setTestStatus] = useState<boolean | null>(null);
    const [testDate, setTestDate] = useState("");
    const [notes, setNotes] = useState("");

    const [productImageFile, setProductImageFile] = useState<File | null>(null);
    const [productImageRemoved, setProductImageRemoved] = useState(false);

    // ============================================================
    // PART SELECTION
    // ============================================================

    const selectedPart = useMemo(
        () =>
            allParts.find(
                (part) => Number(part.id) === Number(selectedPartId)
            ) || null,
        [allParts, selectedPartId]
    );

    const listingsForSelectedPart = useMemo(
        () =>
            selectedPart
                ? productListings.filter(
                    (listing) =>
                        Number(listing.part_id) === Number(selectedPart.id)
                )
                : [],
        [productListings, selectedPart]
    );

    const selectedListing = useMemo(
        () =>
            productListings.find(
                (listing) =>
                    Number(listing.id) === Number(selectedListingId)
            ) || null,
        [productListings, selectedListingId]
    );

    // ============================================================
    // INLINE PART CREATION STATE
    // ============================================================

    const [showCreatePart, setShowCreatePart] = useState(false);
    const [creatingPart, setCreatingPart] = useState(false);

    const [newPartName, setNewPartName] = useState("");
    const [newPartNumber, setNewPartNumber] = useState("");
    const [newPartBrandId, setNewPartBrandId] = useState<number | "">("");
    const [newPartCategoryId, setNewPartCategoryId] = useState<number | "">("");
    const [newPartSeriesId, setNewPartSeriesId] = useState<number | "">("");
    const [newPartBasePrice, setNewPartBasePrice] = useState("");
    const [newPartShortDescription, setNewPartShortDescription] = useState("");
    const [newPartLongDescription, setNewPartLongDescription] = useState("");
    const [availablePartSeries, setAvailablePartSeries] = useState<Term[]>([]);

    // ============================================================
    // INLINE LISTING CREATION STATE
    // ============================================================

    const [showCreateListing, setShowCreateListing] = useState(false);
    const [creatingListing, setCreatingListing] = useState(false);

    const [newListingConditionId, setNewListingConditionId] =
        useState<number | "">("");

    const [newListingPriceMode, setNewListingPriceMode] =
        useState<"automatic" | "manual">("automatic");

    const [newListingPrice, setNewListingPrice] = useState("");
    const [newListingShortDescription, setNewListingShortDescription] =
        useState("");
    const [newListingLongDescription, setNewListingLongDescription] =
        useState("");
    const [newListingSeoTitle, setNewListingSeoTitle] = useState("");
    const [newListingMetaDescription, setNewListingMetaDescription] =
        useState("");
    const [newListingSearchTerms, setNewListingSearchTerms] = useState("");

    const [newListingImageFile, setNewListingImageFile] =
        useState<File | null>(null);

    const [newListingAdditionalImageFiles, setNewListingAdditionalImageFiles] =
        useState<File[]>([]);

    // ============================================================
    // STANDALONE PART FORM STATE
    // ============================================================

    const [selectedBrand, setSelectedBrand] = useState<Term | null>(initialBrand);
    const [selectedCategory, setSelectedCategory] = useState<Term | null>(null);
    const [selectedSeries, setSelectedSeries] = useState<Term | null>(null);

    const [partName, setPartName] = useState("");
    const [partNumber, setPartNumber] = useState("");
    const [partBasePrice, setPartBasePrice] = useState("");

    const [shortDescription, setShortDescription] = useState("");
    const [longDescription, setLongDescription] = useState("");

    const [seoTitle, setSeoTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [searchTerms, setSearchTerms] = useState("");

    const [availableSeries, setAvailableSeries] = useState<Term[]>([]);

    const [partImageFile, setPartImageFile] = useState<File | null>(null);
    const [partImageRemoved, setPartImageRemoved] = useState(false);

    const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
    const [existingAdditionalImageIds, setExistingAdditionalImageIds] =
        useState<number[]>([]);

    // ============================================================
    // STANDALONE PRODUCT LISTING FORM STATE
    // ============================================================

    const [listingConditionId, setListingConditionId] =
        useState<number | "">("");

    const [listingPriceMode, setListingPriceMode] =
        useState<"automatic" | "manual">("automatic");

    const [listingPrice, setListingPrice] = useState("");
    const [listingShortDescription, setListingShortDescription] = useState("");
    const [listingLongDescription, setListingLongDescription] = useState("");

    const [listingSeoTitle, setListingSeoTitle] = useState("");
    const [listingMetaDescription, setListingMetaDescription] = useState("");
    const [listingSearchTerms, setListingSearchTerms] = useState("");

    const [listingImageFile, setListingImageFile] = useState<File | null>(null);
    const [listingImageRemoved, setListingImageRemoved] = useState(false);

    const [listingAdditionalImageFiles, setListingAdditionalImageFiles] =
        useState<File[]>([]);

    const [existingListingAdditionalImageIds, setExistingListingAdditionalImageIds] =
        useState<number[]>([]);

    // ============================================================
    // EDIT MODE — SERIALIZED PRODUCT
    // ============================================================

    useEffect(() => {
        if (!isProduct || !editingProduct) return;

        setSerialNumber(editingProduct.serial_number || "");
        setWorkOrder(editingProduct.work_order || "");
        setInventoryStatus(editingProduct.inventory_status || "active");
        setNotes(editingProduct.notes || "");

        setTestStatus(
            typeof editingProduct.test_status === "boolean"
                ? editingProduct.test_status
                : null
        );

        setTestDate(editingProduct.test_date || "");
        setSelectedShelf(editingProduct.shelf?.[0] || null);

        setProductImageFile(null);
        setProductImageRemoved(false);

        if (editingProduct.product_listing_id) {
            setSelectedListingId(Number(editingProduct.product_listing_id));
        }
    }, [isProduct, editingProduct]);

    useEffect(() => {
        if (!isProduct || !editingProduct) return;

        const listing = productListings.find(
            (item) =>
                Number(item.id) === Number(editingProduct.product_listing_id)
        );

        if (listing) {
            setSelectedListingId(listing.id);
            setSelectedPartId(listing.part_id);
            return;
        }

        // Fallback for older Product records.
        if (!editingProduct.product_listing_id) {
            const partId = editingProduct.part?.[0]?.id;

            if (partId) {
                setSelectedPartId(Number(partId));

                const matchingListing = productListings.find(
                    (item) =>
                        Number(item.part_id) === Number(partId) &&
                        Number(item.condition_id) ===
                        Number(editingProduct.condition?.[0]?.id)
                );

                if (matchingListing) {
                    setSelectedListingId(matchingListing.id);
                }
            }
        }
    }, [isProduct, editingProduct, productListings]);

    // ============================================================
    // EDIT MODE — PART
    // ============================================================

    useEffect(() => {
        if (!isPart || !editingPart) return;

        setPartName(editingPart.name || "");
        setPartNumber(editingPart.part_number || "");

        setSelectedBrand(
            brands.find(
                (brand) =>
                    Number(brand.id) === Number(editingPart.brand_id)
            ) || null
        );

        setSelectedCategory(
            categories.find(
                (category) =>
                    Number(category.id) === Number(editingPart.category_id)
            ) || null
        );

        setPartBasePrice(
            editingPart.base_price != null
                ? String(editingPart.base_price)
                : ""
        );

        setShortDescription(editingPart.short_description || "");
        setLongDescription(editingPart.long_description || "");

        setSeoTitle(editingPart.seo_title || "");
        setMetaDescription(editingPart.meta_description || "");
        setSearchTerms(editingPart.search_terms || "");

        setPartImageFile(null);
        setPartImageRemoved(false);

        setExistingAdditionalImageIds(
            editingPart.additional_image_ids || []
        );

        setAdditionalImageFiles([]);
    }, [isPart, editingPart, brands, categories]);

    // ============================================================
    // EDIT MODE — PRODUCT LISTING
    // ============================================================

    useEffect(() => {
        if (!isListing || !editingListing) return;

        setSelectedPartId(editingListing.part_id);
        setListingConditionId(editingListing.condition_id);

        setListingPriceMode(editingListing.price_mode || "automatic");

        setListingPrice(
            editingListing.list_price != null
                ? String(editingListing.list_price)
                : ""
        );

        setListingShortDescription(editingListing.short_description || "");
        setListingLongDescription(editingListing.long_description || "");

        setListingSeoTitle(editingListing.seo_title || "");
        setListingMetaDescription(editingListing.meta_description || "");
        setListingSearchTerms(editingListing.search_terms || "");

        setListingImageFile(null);
        setListingImageRemoved(false);

        setListingAdditionalImageFiles([]);

        setExistingListingAdditionalImageIds(
            editingListing.additional_image_ids || []
        );
    }, [isListing, editingListing]);

    // ============================================================
    // INITIAL LISTING — ADD SERIALIZED PRODUCT FROM LISTING DETAIL
    // ============================================================

    useEffect(() => {
        if (!isProduct || editingProduct || !initialListingId) return;

        const listing = productListings.find(
            (item) => Number(item.id) === Number(initialListingId)
        );

        if (listing) {
            setSelectedListingId(listing.id);
            setSelectedPartId(listing.part_id);
        }
    }, [isProduct, editingProduct, initialListingId, productListings]);

    // ============================================================
    // LOAD SERIES FOR PART
    // ============================================================

    useEffect(() => {
        if (!isPart || !selectedBrand) {
            setAvailableSeries([]);
            setSelectedSeries(null);
            return;
        }

        let cancelled = false;

        TaxonomyService.getSeriesByBrand(selectedBrand.id)
            .then((data) => {
                if (!cancelled) setAvailableSeries(data || []);
            })
            .catch((error) => {
                console.error("Failed loading Part series:", error);
                if (!cancelled) setAvailableSeries([]);
            });

        return () => {
            cancelled = true;
        };
    }, [isPart, selectedBrand]);

    useEffect(() => {
        if (
            !isPart ||
            !editingPart?.series_id ||
            availableSeries.length === 0
        ) {
            return;
        }

        setSelectedSeries(
            availableSeries.find(
                (item) =>
                    Number(item.id) === Number(editingPart.series_id)
            ) || null
        );
    }, [isPart, editingPart, availableSeries]);

    // ============================================================
    // LOAD SERIES FOR INLINE PART CREATION
    // ============================================================

    useEffect(() => {
        if (!showCreatePart || !newPartBrandId) {
            setAvailablePartSeries([]);
            setNewPartSeriesId("");
            return;
        }

        let cancelled = false;

        TaxonomyService.getSeriesByBrand(Number(newPartBrandId))
            .then((data) => {
                if (!cancelled) setAvailablePartSeries(data || []);
            })
            .catch((error) => {
                console.error("Failed loading inline Part series:", error);
                if (!cancelled) setAvailablePartSeries([]);
            });

        return () => {
            cancelled = true;
        };
    }, [showCreatePart, newPartBrandId]);

    // ============================================================
    // IMAGE HANDLERS
    // ============================================================

    const handleProductImageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setProductImageFile(event.target.files?.[0] || null);
        setProductImageRemoved(false);
        event.target.value = "";
    };

    const handlePartImageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setPartImageFile(event.target.files?.[0] || null);
        setPartImageRemoved(false);
        event.target.value = "";
    };

    const handleListingImageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setListingImageFile(event.target.files?.[0] || null);
        setListingImageRemoved(false);
        event.target.value = "";
    };

    // ============================================================
    // INLINE CREATE PART
    // ============================================================

    const handleCreatePart = async () => {
        if (
            !newPartName.trim() ||
            !newPartNumber.trim() ||
            !newPartBrandId ||
            !newPartCategoryId
        ) {
            alert(
                "Please complete the required Part fields:\n\n" +
                "Part Name\nPart Number\nBrand\nCategory"
            );
            return;
        }

        try {
            setCreatingPart(true);

            const payload: CreatePartPayload = {
                name: newPartName.trim(),
                part_number: newPartNumber.trim(),
                brand_id: Number(newPartBrandId),
                category_id: Number(newPartCategoryId),
                series_id: newPartSeriesId
                    ? Number(newPartSeriesId)
                    : null,
                base_price: newPartBasePrice.trim()
                    ? Number(newPartBasePrice)
                    : null,
                short_description: newPartShortDescription.trim(),
                long_description: newPartLongDescription.trim(),
            };

            const createdPart = await TaxonomyService.createPart(payload);

            await fetchBootstrap();

            setSelectedPartId(createdPart.id);
            setSelectedListingId("");
            setShowCreatePart(false);

            setNewPartName("");
            setNewPartNumber("");
            setNewPartBrandId("");
            setNewPartCategoryId("");
            setNewPartSeriesId("");
            setNewPartBasePrice("");
            setNewPartShortDescription("");
            setNewPartLongDescription("");
            setAvailablePartSeries([]);
        } catch (error: any) {
            console.error("Failed to create Part:", error);
            console.error("API ERROR:", error?.response?.data);

            alert(
                JSON.stringify(
                    error?.response?.data ||
                    error?.message ||
                    "Failed to create Part."
                )
            );
        } finally {
            setCreatingPart(false);
        }
    };

    // ============================================================
    // INLINE CREATE PRODUCT LISTING
    // ============================================================

    const handleCreateListing = async () => {
        if (!selectedPart) {
            alert("Select a Part before creating a Product Listing.");
            return;
        }

        if (!newListingConditionId) {
            alert("Please select a Condition.");
            return;
        }

        if (
            newListingPriceMode === "manual" &&
            (
                !newListingPrice.trim() ||
                !Number.isFinite(Number(newListingPrice)) ||
                Number(newListingPrice) < 0
            )
        ) {
            alert("Enter a valid manual listing price.");
            return;
        }

        try {
            setCreatingListing(true);

            const condition = conditions.find(
                (item) =>
                    Number(item.id) === Number(newListingConditionId)
            );

            const imageId = newListingImageFile
                ? await uploadImage(newListingImageFile)
                : undefined;

            const additionalImageIds =
                newListingAdditionalImageFiles.length > 0
                    ? await Promise.all(
                        newListingAdditionalImageFiles.map(uploadImage)
                    )
                    : [];

            const payload: ProductListingPayload = {
                title: `${selectedPart.name} - ${condition?.name || "Condition"}`,
                part_id: selectedPart.id,
                condition_id: Number(newListingConditionId),
                price_mode: newListingPriceMode,
                status: "publish",

                ...(newListingPriceMode === "manual"
                    ? { list_price: Number(newListingPrice) }
                    : {}),

                ...(newListingShortDescription.trim()
                    ? { short_description: newListingShortDescription.trim() }
                    : {}),

                ...(newListingLongDescription.trim()
                    ? { long_description: newListingLongDescription.trim() }
                    : {}),

                ...(newListingSeoTitle.trim()
                    ? { seo_title: newListingSeoTitle.trim() }
                    : {}),

                ...(newListingMetaDescription.trim()
                    ? { meta_description: newListingMetaDescription.trim() }
                    : {}),

                ...(newListingSearchTerms.trim()
                    ? { search_terms: newListingSearchTerms.trim() }
                    : {}),

                ...(imageId ? { image_id: imageId } : {}),

                ...(additionalImageIds.length > 0
                    ? { additional_image_ids: additionalImageIds }
                    : {}),
            };

            const createdListing =
                await ProductListingService.create(payload);

            await fetchBootstrap();

            setSelectedListingId(createdListing.id);
            setShowCreateListing(false);

            setNewListingConditionId("");
            setNewListingPriceMode("automatic");
            setNewListingPrice("");
            setNewListingShortDescription("");
            setNewListingLongDescription("");
            setNewListingSeoTitle("");
            setNewListingMetaDescription("");
            setNewListingSearchTerms("");
            setNewListingImageFile(null);
            setNewListingAdditionalImageFiles([]);
        } catch (error: any) {
            console.error("Failed to create Product Listing:", error);
            console.error("API ERROR:", error?.response?.data);

            alert(
                JSON.stringify(
                    error?.response?.data ||
                    error?.message ||
                    "Failed to create Product Listing."
                )
            );
        } finally {
            setCreatingListing(false);
        }
    };

    // ============================================================
    // VALIDATION
    // ============================================================

    const missingFields: string[] = [];

    if (isProduct) {
        if (!selectedPart) missingFields.push("Part");
        if (!selectedListing) missingFields.push("Product Listing");
        if (!serialNumber.trim()) missingFields.push("Serial Number");
    }

    if (isPart) {
        if (!selectedBrand) missingFields.push("Brand");
        if (!selectedCategory) missingFields.push("Category");
        if (!partNumber.trim()) missingFields.push("Part Number");
        if (!partName.trim()) missingFields.push("Part Name");
    }

    if (isListing) {
        if (!selectedPart) missingFields.push("Part");
        if (!listingConditionId) missingFields.push("Condition");

        if (
            listingPriceMode === "manual" &&
            (
                !listingPrice.trim() ||
                !Number.isFinite(Number(listingPrice)) ||
                Number(listingPrice) < 0
            )
        ) {
            missingFields.push("Valid Listing Price");
        }
    }

    // ============================================================
    // SUBMIT — SERIALIZED PRODUCT
    // ============================================================

    const handleProductSubmit = async () => {
        if (!selectedListing || !serialNumber.trim()) {
            throw new Error("A Product Listing and Serial Number are required.");
        }

        const imageId = productImageFile
            ? await uploadImage(productImageFile)
            : productImageRemoved
                ? null
                : editingProduct?.image_id;

        const payload: ProductPayload = {
            product_listing_id: selectedListing.id,
            serial_number: serialNumber.trim(),
            status: "publish",
            inventory_status: inventoryStatus,

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

            ...(imageId !== undefined
                ? { image_id: imageId }
                : {}),
        };

        const response = isProductEditing
            ? await ProductService.update(editingProduct!.id, payload)
            : await ProductService.create(payload);

        const normalized = normalizeProduct(response);

        if (isProductEditing) {
            onUpdated?.(normalized);
        } else {
            onCreated?.(normalized);
        }
    };

    // ============================================================
    // SUBMIT — MASTER PART
    // ============================================================

    const handlePartSubmit = async () => {
        if (
            !selectedBrand ||
            !selectedCategory ||
            !partName.trim() ||
            !partNumber.trim()
        ) {
            throw new Error("Please complete the required Part fields.");
        }

        const imageId = partImageFile
            ? await uploadImage(partImageFile)
            : partImageRemoved
                ? null
                : editingPart?.image_id ?? null;

        const newAdditionalImageIds =
            additionalImageFiles.length > 0
                ? await Promise.all(additionalImageFiles.map(uploadImage))
                : [];

        const payload: CreatePartPayload = {
            name: partName.trim(),
            part_number: partNumber.trim(),
            brand_id: selectedBrand.id,
            category_id: selectedCategory.id,
            series_id: selectedSeries?.id ?? null,
            base_price: partBasePrice.trim()
                ? Number(partBasePrice)
                : null,
            short_description: shortDescription.trim(),
            long_description: longDescription.trim(),
            seo_title: seoTitle.trim(),
            meta_description: metaDescription.trim(),
            search_terms: searchTerms.trim(),
            image_id: imageId,
            additional_image_ids: [
                ...existingAdditionalImageIds,
                ...newAdditionalImageIds,
            ],
        };

        const response = isPartEditing
            ? await TaxonomyService.updatePart(editingPart!.id, payload)
            : await TaxonomyService.createPart(payload);

        if (isPartEditing) {
            onUpdated?.(response);
        } else {
            onCreated?.(response);
        }

        clearEditing?.();
    };

    // ============================================================
    // SUBMIT — PRODUCT LISTING
    // ============================================================

    const handleListingSubmit = async () => {
        if (!selectedPart || !listingConditionId) {
            throw new Error("Please select a Part and Condition.");
        }

        if (
            listingPriceMode === "manual" &&
            (
                !listingPrice.trim() ||
                !Number.isFinite(Number(listingPrice)) ||
                Number(listingPrice) < 0
            )
        ) {
            throw new Error("Enter a valid manual listing price.");
        }

        const condition = conditions.find(
            (item) => Number(item.id) === Number(listingConditionId)
        );

        const imageId = listingImageFile
            ? await uploadImage(listingImageFile)
            : listingImageRemoved
                ? null
                : editingListing?.image_id ?? null;

        const newAdditionalImageIds =
            listingAdditionalImageFiles.length > 0
                ? await Promise.all(
                    listingAdditionalImageFiles.map(uploadImage)
                )
                : [];

        const payload: ProductListingPayload = {
            title: `${selectedPart.name} - ${condition?.name || "Condition"}`,
            part_id: selectedPart.id,
            condition_id: Number(listingConditionId),
            price_mode: listingPriceMode,
            status: editingListing?.status || "publish",

            ...(listingPriceMode === "manual"
                ? { list_price: Number(listingPrice) }
                : {}),

            short_description: listingShortDescription.trim(),
            long_description: listingLongDescription.trim(),
            seo_title: listingSeoTitle.trim(),
            meta_description: listingMetaDescription.trim(),
            search_terms: listingSearchTerms.trim(),

            image_id: imageId,

            additional_image_ids: [
                ...existingListingAdditionalImageIds,
                ...newAdditionalImageIds,
            ],
        };

        const response = isListingEditing
            ? await ProductListingService.update(editingListing!.id, payload)
            : await ProductListingService.create(payload);

        if (isListingEditing) {
            onUpdated?.(response);
        } else {
            onCreated?.(response);
        }

        clearEditing?.();
    };

    // ============================================================
    // MAIN SUBMIT
    // ============================================================

    const handleSubmit = async () => {
        if (missingFields.length > 0) {
            alert(
                "Please complete the following required fields:\n\n" +
                missingFields.join("\n")
            );
            return;
        }

        try {
            setLoading(true);

            if (isProduct) {
                await handleProductSubmit();
            } else if (isPart) {
                await handlePartSubmit();
            } else {
                await handleListingSubmit();
            }
        } catch (error: any) {
            console.error("Inventory form save failed:", error);
            console.error("API ERROR:", error?.response?.data);

            alert(
                JSON.stringify(
                    error?.response?.data ||
                    error?.message ||
                    "Failed to save."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CANCEL
    // ============================================================

    const handleCancel = () => {
        clearEditing?.();
        onClose?.();
    };

    // ============================================================
    // UI HELPERS
    // ============================================================

    const renderPartSelector = () => (
        <div>
            <label className={labelClass}>
                Part <span className="text-red-500">*</span>
            </label>

            <select
                value={selectedPartId}
                disabled={isProductEditing}
                onChange={(event) => {
                    setSelectedPartId(
                        event.target.value ? Number(event.target.value) : ""
                    );
                    setSelectedListingId("");
                }}
                className={inputClass}
            >
                <option value="">Select Part</option>

                {allParts.map((part) => (
                    <option key={part.id} value={part.id}>
                        {part.part_number
                            ? `${part.part_number} — ${part.name}`
                            : part.name}
                    </option>
                ))}
            </select>
        </div>
    );

    const renderConditionSelector = (
        value: number | "",
        onChange: (value: number | "") => void
    ) => (
        <div>
            <label className={labelClass}>
                Condition <span className="text-red-500">*</span>
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value ? Number(event.target.value) : ""
                    )
                }
                className={inputClass}
            >
                <option value="">Select Condition</option>

                {conditions.map((condition) => (
                    <option key={condition.id} value={condition.id}>
                        {condition.name}
                    </option>
                ))}
            </select>
        </div>
    );

    const renderListingPricing = (
        priceMode: "automatic" | "manual",
        setPriceMode: (value: "automatic" | "manual") => void,
        price: string,
        setPrice: (value: string) => void
    ) => (
        <>
            <div>
                <label className={labelClass}>Pricing Method</label>

                <select
                    value={priceMode}
                    onChange={(event) =>
                        setPriceMode(
                            event.target.value as "automatic" | "manual"
                        )
                    }
                    className={inputClass}
                >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                </select>
            </div>

            {priceMode === "manual" && (
                <div>
                    <label className={labelClass}>
                        Listing Price <span className="text-red-500">*</span>
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        className={inputClass}
                        placeholder="0.00"
                    />
                </div>
            )}
        </>
    );

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="w-full max-w-4xl">
            {/* HEADER */}

            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {isEditing
                        ? `Edit ${isProduct
                            ? "Product"
                            : isPart
                                ? "Part"
                                : "Product Listing"
                        }`
                        : `Add ${isProduct
                            ? "Product"
                            : isPart
                                ? "Part"
                                : "Product Listing"
                        }`}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {isProduct
                        ? "Add or update an individual serialized inventory unit."
                        : isPart
                            ? "Create or update a master Part catalogue record."
                            : "Create or update a Part and Condition listing."}
                </p>
            </div>

            {/* ====================================================
                SERIALIZED PRODUCT FORM
            ==================================================== */}

            {isProduct && (
                <>
                    <section>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            1. Part
                        </h3>

                        {renderPartSelector()}

                        {!isProductEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreatePart((current) => !current);
                                    setShowCreateListing(false);
                                }}
                                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                {showCreatePart
                                    ? "Cancel Part creation"
                                    : "+ Create a new Part"}
                            </button>
                        )}

                        {showCreatePart && (
                            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                                    New Part
                                </h4>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClass}>Part Name *</label>
                                        <input
                                            value={newPartName}
                                            onChange={(event) => setNewPartName(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Part Number *</label>
                                        <input
                                            value={newPartNumber}
                                            onChange={(event) => setNewPartNumber(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Brand *</label>
                                        <select
                                            value={newPartBrandId}
                                            onChange={(event) => {
                                                setNewPartBrandId(
                                                    event.target.value ? Number(event.target.value) : ""
                                                );
                                                setNewPartSeriesId("");
                                            }}
                                            className={inputClass}
                                        >
                                            <option value="">Select Brand</option>
                                            {brands.map((brand) => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Category *</label>
                                        <select
                                            value={newPartCategoryId}
                                            onChange={(event) =>
                                                setNewPartCategoryId(
                                                    event.target.value ? Number(event.target.value) : ""
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Series</label>
                                        <select
                                            value={newPartSeriesId}
                                            disabled={!newPartBrandId}
                                            onChange={(event) =>
                                                setNewPartSeriesId(
                                                    event.target.value ? Number(event.target.value) : ""
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">Select Series</option>
                                            {availablePartSeries.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Base Price</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={newPartBasePrice}
                                            onChange={(event) => setNewPartBasePrice(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Short Description</label>
                                        <textarea
                                            rows={2}
                                            value={newPartShortDescription}
                                            onChange={(event) => setNewPartShortDescription(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Long Description</label>
                                        <textarea
                                            rows={4}
                                            value={newPartLongDescription}
                                            onChange={(event) => setNewPartLongDescription(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        disabled={creatingPart}
                                        onClick={handleCreatePart}
                                        className={buttonClass}
                                    >
                                        {creatingPart ? "Creating Part..." : "Create Part"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedPart && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Selected Part
                                </p>
                                <p className="mt-1 font-semibold text-gray-900">
                                    {selectedPart.name}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Part Number: {selectedPart.part_number || "—"}
                                </p>
                            </div>
                        )}
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            2. Product Listing
                        </h3>

                        <div>
                            <label className={labelClass}>
                                Product Listing <span className="text-red-500">*</span>
                            </label>

                            <select
                                value={selectedListingId}
                                disabled={!selectedPart || isProductEditing}
                                onChange={(event) =>
                                    setSelectedListingId(
                                        event.target.value ? Number(event.target.value) : ""
                                    )
                                }
                                className={inputClass}
                            >
                                <option value="">
                                    {!selectedPart
                                        ? "Select a Part First"
                                        : listingsForSelectedPart.length === 0
                                            ? "No Product Listings Available"
                                            : "Select Product Listing"}
                                </option>

                                {listingsForSelectedPart.map((listing) => {
                                    const condition = conditions.find(
                                        (item) =>
                                            Number(item.id) === Number(listing.condition_id)
                                    );

                                    return (
                                        <option key={listing.id} value={listing.id}>
                                            {listing.title} — {condition?.name || "Condition"} — SKU: {listing.sku}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {selectedListing && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Selected Product Listing
                                </p>
                                <p className="mt-1 font-semibold text-gray-900">
                                    {selectedListing.title}
                                </p>
                                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">SKU</span>
                                        <p className="font-medium text-gray-900">
                                            {selectedListing.sku || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Condition</span>
                                        <p className="font-medium text-gray-900">
                                            {conditions.find(
                                                (item) => Number(item.id) === Number(selectedListing.condition_id)
                                            )?.name || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Listing Price</span>
                                        <p className="font-medium text-gray-900">
                                            {selectedListing.list_price != null
                                                ? `$${Number(selectedListing.list_price).toFixed(2)}`
                                                : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Available Quantity</span>
                                        <p className="font-medium text-gray-900">
                                            {selectedListing.quantity ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isProductEditing && selectedPart && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateListing((current) => !current);
                                    setShowCreatePart(false);
                                }}
                                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                {showCreateListing
                                    ? "Cancel Product Listing creation"
                                    : "+ Create a Product Listing"}
                            </button>
                        )}

                        {showCreateListing && selectedPart && (
                            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5">
                                <h4 className="mb-4 text-sm font-semibold text-gray-900">
                                    New Product Listing
                                </h4>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {renderConditionSelector(
                                        newListingConditionId,
                                        setNewListingConditionId
                                    )}

                                    {renderListingPricing(
                                        newListingPriceMode,
                                        setNewListingPriceMode,
                                        newListingPrice,
                                        setNewListingPrice
                                    )}

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Short Description</label>
                                        <textarea
                                            rows={2}
                                            value={newListingShortDescription}
                                            onChange={(event) => setNewListingShortDescription(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Long Description</label>
                                        <textarea
                                            rows={4}
                                            value={newListingLongDescription}
                                            onChange={(event) => setNewListingLongDescription(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>SEO Title</label>
                                        <input
                                            value={newListingSeoTitle}
                                            onChange={(event) => setNewListingSeoTitle(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Search Terms</label>
                                        <input
                                            value={newListingSearchTerms}
                                            onChange={(event) => setNewListingSearchTerms(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Meta Description</label>
                                        <textarea
                                            rows={3}
                                            value={newListingMetaDescription}
                                            onChange={(event) => setNewListingMetaDescription(event.target.value)}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Listing Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                setNewListingImageFile(event.target.files?.[0] || null);
                                                event.target.value = "";
                                            }}
                                            className={fileInputClass}
                                        />
                                        {newListingImageFile && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                {newListingImageFile.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Additional Images</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(event) => {
                                                setNewListingAdditionalImageFiles((current) => [
                                                    ...current,
                                                    ...Array.from(event.target.files || []),
                                                ]);
                                                event.target.value = "";
                                            }}
                                            className={fileInputClass}
                                        />
                                        {newListingAdditionalImageFiles.length > 0 && (
                                            <p className="mt-1 text-xs text-gray-500">
                                                {newListingAdditionalImageFiles.length} image(s) selected
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        disabled={creatingListing}
                                        onClick={handleCreateListing}
                                        className={buttonClass}
                                    >
                                        {creatingListing ? "Creating Listing..." : "Create Product Listing"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            3. Serialized Product Details
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Serial Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={serialNumber}
                                    onChange={(event) => setSerialNumber(event.target.value)}
                                    className={inputClass}
                                    placeholder="Enter serial number"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Work Order</label>
                                <input
                                    value={workOrder}
                                    onChange={(event) => setWorkOrder(event.target.value)}
                                    className={inputClass}
                                    placeholder="Enter work order"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Inventory Status</label>
                                <select
                                    value={inventoryStatus}
                                    onChange={(event) =>
                                        setInventoryStatus(
                                            event.target.value as "active" | "sold" | "archived"
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="active">Active</option>
                                    <option value="sold">Sold</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Shelf</label>
                                <select
                                    value={selectedShelf?.id ?? ""}
                                    onChange={(event) =>
                                        setSelectedShelf(
                                            shelves.find(
                                                (item) => item.id === Number(event.target.value)
                                            ) || null
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select Shelf</option>
                                    {shelves.map((shelf) => (
                                        <option key={shelf.id} value={shelf.id}>
                                            {shelf.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Testing
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>Test Status</label>
                                <select
                                    value={
                                        testStatus === null
                                            ? ""
                                            : testStatus
                                                ? "passed"
                                                : "failed"
                                    }
                                    onChange={(event) => {
                                        if (!event.target.value) {
                                            setTestStatus(null);
                                        } else {
                                            setTestStatus(event.target.value === "passed");
                                        }
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">Not Tested</option>
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Test Date</label>
                                <input
                                    type="date"
                                    value={testDate}
                                    onChange={(event) => setTestDate(event.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Additional Information
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Unit Notes</label>
                                <textarea
                                    rows={4}
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    className={inputClass}
                                    placeholder="Enter notes about this individual unit..."
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Serialized Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleProductImageChange}
                                    className={fileInputClass}
                                />

                                {isProductEditing &&
                                    !productImageRemoved &&
                                    !productImageFile &&
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
                                                onClick={() => {
                                                    setProductImageRemoved(true);
                                                    setProductImageFile(null);
                                                }}
                                                className="mt-2 text-sm font-medium text-red-600"
                                            >
                                                Remove Image
                                            </button>
                                        </div>
                                    )}

                                {productImageFile && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        New image: {productImageFile.name}
                                    </p>
                                )}

                                {productImageRemoved && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Existing image will be removed.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ====================================================
                STANDALONE PART FORM
            ==================================================== */}

            {isPart && (
                <>
                    <section>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Brand <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedBrand?.id ?? ""}
                                    disabled={!!initialBrand}
                                    onChange={(event) => {
                                        setSelectedBrand(
                                            brands.find(
                                                (item) => item.id === Number(event.target.value)
                                            ) || null
                                        );
                                        setSelectedSeries(null);
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedCategory?.id ?? ""}
                                    onChange={(event) =>
                                        setSelectedCategory(
                                            categories.find(
                                                (item) => item.id === Number(event.target.value)
                                            ) || null
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Part Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={partNumber}
                                    onChange={(event) => setPartNumber(event.target.value)}
                                    className={inputClass}
                                    placeholder="Enter Part number"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Part Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={partName}
                                    onChange={(event) => setPartName(event.target.value)}
                                    className={inputClass}
                                    placeholder="Enter Part name"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Series</label>
                                <select
                                    value={selectedSeries?.id ?? ""}
                                    disabled={!selectedBrand || availableSeries.length === 0}
                                    onChange={(event) =>
                                        setSelectedSeries(
                                            availableSeries.find(
                                                (item) => item.id === Number(event.target.value)
                                            ) || null
                                        )
                                    }
                                    className={inputClass}
                                >
                                    <option value="">
                                        {!selectedBrand
                                            ? "Select Brand First"
                                            : availableSeries.length === 0
                                                ? "No Series Available"
                                                : "Select Series"}
                                    </option>
                                    {availableSeries.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Base Price</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={partBasePrice}
                                    onChange={(event) => setPartBasePrice(event.target.value)}
                                    className={inputClass}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Descriptions
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Short Description</label>
                                <textarea
                                    rows={3}
                                    value={shortDescription}
                                    onChange={(event) => setShortDescription(event.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Long Description</label>
                                <textarea
                                    rows={6}
                                    value={longDescription}
                                    onChange={(event) => setLongDescription(event.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            SEO
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>SEO Title</label>
                                <input
                                    value={seoTitle}
                                    onChange={(event) => setSeoTitle(event.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Meta Description</label>
                                <textarea
                                    rows={3}
                                    value={metaDescription}
                                    onChange={(event) => setMetaDescription(event.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Search Terms</label>
                                <input
                                    value={searchTerms}
                                    onChange={(event) => setSearchTerms(event.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Part Image
                        </h3>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePartImageChange}
                            className={fileInputClass}
                        />

                        {isPartEditing &&
                            !partImageRemoved &&
                            !partImageFile &&
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
                                        onClick={() => {
                                            setPartImageRemoved(true);
                                            setPartImageFile(null);
                                        }}
                                        className="mt-2 text-sm font-medium text-red-600"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            )}

                        {partImageFile && (
                            <p className="mt-2 text-sm text-gray-500">
                                New image: {partImageFile.name}
                            </p>
                        )}
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Additional Images
                        </h3>

                        <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                            + Add Images
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(event) => {
                                    setAdditionalImageFiles((current) => [
                                        ...current,
                                        ...Array.from(event.target.files || []),
                                    ]);
                                    event.target.value = "";
                                }}
                            />
                        </label>

                        {isPartEditing &&
                            editingPart?.additional_image_urls &&
                            editingPart.additional_image_urls.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        Existing Images
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        {editingPart.additional_image_urls.map((url, index) => {
                                            const imageId =
                                                editingPart.additional_image_ids?.[index];

                                            if (
                                                !imageId ||
                                                !existingAdditionalImageIds.includes(imageId)
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={imageId}
                                                    className="relative h-28 w-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`${editingPart.name} additional image ${index + 1}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExistingAdditionalImageIds((current) =>
                                                                current.filter((id) => id !== imageId)
                                                            )
                                                        }
                                                        className="absolute right-1 top-1 rounded bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {additionalImageFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                    New Images
                                </p>
                                {additionalImageFiles.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                                    >
                                        <span className="truncate text-sm text-gray-600">
                                            {file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAdditionalImageFiles((current) =>
                                                    current.filter((_, i) => i !== index)
                                                )
                                            }
                                            className="ml-3 text-sm font-medium text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ====================================================
                STANDALONE PRODUCT LISTING FORM
            ==================================================== */}

            {isListing && (
                <>
                    <section>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            1. Part
                        </h3>

                        {renderPartSelector()}

                        {selectedPart && (
                            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p className="font-semibold text-gray-900">
                                    {selectedPart.name}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Part Number: {selectedPart.part_number || "—"}
                                </p>
                            </div>
                        )}
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            2. Listing Details
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {renderConditionSelector(
                                listingConditionId,
                                setListingConditionId
                            )}

                            {renderListingPricing(
                                listingPriceMode,
                                setListingPriceMode,
                                listingPrice,
                                setListingPrice
                            )}
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Descriptions
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Short Description</label>
                                <textarea
                                    rows={3}
                                    value={listingShortDescription}
                                    onChange={(event) => setListingShortDescription(event.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Long Description</label>
                                <textarea
                                    rows={6}
                                    value={listingLongDescription}
                                    onChange={(event) => setListingLongDescription(event.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            SEO
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>SEO Title</label>
                                <input
                                    value={listingSeoTitle}
                                    onChange={(event) => setListingSeoTitle(event.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Meta Description</label>
                                <textarea
                                    rows={3}
                                    value={listingMetaDescription}
                                    onChange={(event) => setListingMetaDescription(event.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Search Terms</label>
                                <input
                                    value={listingSearchTerms}
                                    onChange={(event) => setListingSearchTerms(event.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Product Listing Image
                        </h3>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleListingImageChange}
                            className={fileInputClass}
                        />

                        {isListingEditing &&
                            !listingImageRemoved &&
                            !listingImageFile &&
                            editingListing?.image_url && (
                                <div className="mt-4">
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        Current Image
                                    </p>
                                    <div className="h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                        <img
                                            src={editingListing.image_url}
                                            alt={editingListing.title}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setListingImageRemoved(true);
                                            setListingImageFile(null);
                                        }}
                                        className="mt-2 text-sm font-medium text-red-600"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            )}

                        {listingImageFile && (
                            <p className="mt-2 text-sm text-gray-500">
                                New image: {listingImageFile.name}
                            </p>
                        )}

                        {listingImageRemoved && (
                            <p className="mt-2 text-sm text-gray-500">
                                Existing image will be removed.
                            </p>
                        )}
                    </section>

                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            Additional Images
                        </h3>

                        <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                            + Add Images
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(event) => {
                                    setListingAdditionalImageFiles((current) => [
                                        ...current,
                                        ...Array.from(event.target.files || []),
                                    ]);
                                    event.target.value = "";
                                }}
                            />
                        </label>

                        {isListingEditing &&
                            editingListing?.additional_image_urls &&
                            editingListing.additional_image_urls.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-sm font-medium text-gray-700">
                                        Existing Images
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        {editingListing.additional_image_urls.map((url, index) => {
                                            const imageId =
                                                editingListing.additional_image_ids?.[index];

                                            if (
                                                !imageId ||
                                                !existingListingAdditionalImageIds.includes(imageId)
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    key={imageId}
                                                    className="relative h-28 w-28 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`${editingListing.title} additional image ${index + 1}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExistingListingAdditionalImageIds((current) =>
                                                                current.filter((id) => id !== imageId)
                                                            )
                                                        }
                                                        className="absolute right-1 top-1 rounded bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {listingAdditionalImageFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                    New Images
                                </p>
                                {listingAdditionalImageFiles.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                                    >
                                        <span className="truncate text-sm text-gray-600">
                                            {file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setListingAdditionalImageFiles((current) =>
                                                    current.filter((_, i) => i !== index)
                                                )
                                            }
                                            className="ml-3 text-sm font-medium text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}

            {/* ====================================================
                SAVE / CANCEL
            ==================================================== */}

            <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading || creatingPart || creatingListing}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                        loading ||
                        creatingPart ||
                        creatingListing ||
                        missingFields.length > 0
                    }
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading
                        ? "Saving..."
                        : isEditing
                            ? `Update ${isProduct
                                ? "Serialized Product"
                                : isPart
                                    ? "Part"
                                    : "Product Listing"
                            }`
                            : `Create ${isProduct
                                ? "Serialized Product"
                                : isPart
                                    ? "Part"
                                    : "Product Listing"
                            }`}
                </button>
            </div>
        </div>
    );
};

export default InventoryForm;
