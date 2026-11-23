
import React, { useEffect, useMemo, useState } from "react";

import { ProductService } from "../../services/productService";
import { ProductListingService } from "../../services/productListingService";
import { TaxonomyService } from "../../services/taxonomyService";
import { uploadImage } from "../../services/mediaService";
import SerializedProductForm from "./components/SerializedProductForm";
import PartForm from "./components/PartForm";
import ListingForm from "./components/ListingForm";
import SaveCancelButtons from "./components/SaveCancelButtons";

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
                <SerializedProductForm
                    selectedListingId={selectedListingId}
                    isProduct={isProduct}
                    isProductEditing={isProductEditing}
                    editingProduct={editingProduct}

                    brands={brands}
                    categories={categories}
                    conditions={conditions}
                    shelves={shelves}

                    selectedPart={selectedPart}
                    selectedListing={selectedListing}
                    listingsForSelectedPart={listingsForSelectedPart}
                    setSelectedListingId={setSelectedListingId}

                    serialNumber={serialNumber}
                    setSerialNumber={setSerialNumber}
                    workOrder={workOrder}
                    setWorkOrder={setWorkOrder}
                    inventoryStatus={inventoryStatus}
                    setInventoryStatus={setInventoryStatus}

                    selectedShelf={selectedShelf}
                    setSelectedShelf={setSelectedShelf}
                    testStatus={testStatus}
                    setTestStatus={setTestStatus}
                    testDate={testDate}
                    setTestDate={setTestDate}
                    notes={notes}
                    setNotes={setNotes}

                    productImageFile={productImageFile}
                    productImageRemoved={productImageRemoved}
                    setProductImageFile={setProductImageFile}
                    setProductImageRemoved={setProductImageRemoved}

                    showCreatePart={showCreatePart}
                    setShowCreatePart={setShowCreatePart}
                    creatingPart={creatingPart}
                    newPartName={newPartName}
                    setNewPartName={setNewPartName}
                    newPartNumber={newPartNumber}
                    setNewPartNumber={setNewPartNumber}
                    newPartBrandId={newPartBrandId}
                    setNewPartBrandId={setNewPartBrandId}
                    newPartCategoryId={newPartCategoryId}
                    setNewPartCategoryId={setNewPartCategoryId}
                    newPartSeriesId={newPartSeriesId}
                    setNewPartSeriesId={setNewPartSeriesId}
                    newPartBasePrice={newPartBasePrice}
                    setNewPartBasePrice={setNewPartBasePrice}
                    newPartShortDescription={newPartShortDescription}
                    setNewPartShortDescription={setNewPartShortDescription}
                    newPartLongDescription={newPartLongDescription}
                    setNewPartLongDescription={setNewPartLongDescription}
                    availablePartSeries={availablePartSeries}
                    handleCreatePart={handleCreatePart}

                    showCreateListing={showCreateListing}
                    setShowCreateListing={setShowCreateListing}
                    creatingListing={creatingListing}
                    newListingConditionId={newListingConditionId}
                    setNewListingConditionId={setNewListingConditionId}
                    newListingPriceMode={newListingPriceMode}
                    setNewListingPriceMode={setNewListingPriceMode}
                    newListingPrice={newListingPrice}
                    setNewListingPrice={setNewListingPrice}
                    newListingShortDescription={newListingShortDescription}
                    setNewListingShortDescription={setNewListingShortDescription}
                    newListingLongDescription={newListingLongDescription}
                    setNewListingLongDescription={setNewListingLongDescription}
                    newListingSeoTitle={newListingSeoTitle}
                    setNewListingSeoTitle={setNewListingSeoTitle}
                    newListingSearchTerms={newListingSearchTerms}
                    setNewListingSearchTerms={setNewListingSearchTerms}
                    newListingMetaDescription={newListingMetaDescription}
                    setNewListingMetaDescription={setNewListingMetaDescription}
                    newListingImageFile={newListingImageFile}
                    setNewListingImageFile={setNewListingImageFile}
                    newListingAdditionalImageFiles={newListingAdditionalImageFiles}
                    setNewListingAdditionalImageFiles={setNewListingAdditionalImageFiles}
                    handleCreateListing={handleCreateListing}

                    renderPartSelector={renderPartSelector}
                    renderConditionSelector={renderConditionSelector}
                    renderListingPricing={renderListingPricing}
                    handleProductImageChange={handleProductImageChange}
                />
            )}

            {/* ====================================================
                STANDALONE PART FORM
            ==================================================== */}

            {isPart && (
                <PartForm
                    isPartEditing={isPartEditing}
                    editingPart={editingPart}
                    initialBrand={initialBrand}
                    brands={brands}
                    categories={categories}

                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSeries={selectedSeries}
                    setSelectedSeries={setSelectedSeries}

                    partName={partName}
                    setPartName={setPartName}
                    partNumber={partNumber}
                    setPartNumber={setPartNumber}
                    partBasePrice={partBasePrice}
                    setPartBasePrice={setPartBasePrice}

                    shortDescription={shortDescription}
                    setShortDescription={setShortDescription}
                    longDescription={longDescription}
                    setLongDescription={setLongDescription}

                    seoTitle={seoTitle}
                    setSeoTitle={setSeoTitle}
                    metaDescription={metaDescription}
                    setMetaDescription={setMetaDescription}
                    searchTerms={searchTerms}
                    setSearchTerms={setSearchTerms}

                    availableSeries={availableSeries}

                    partImageFile={partImageFile}
                    partImageRemoved={partImageRemoved}
                    setPartImageFile={setPartImageFile}
                    setPartImageRemoved={setPartImageRemoved}
                    handlePartImageChange={handlePartImageChange}

                    additionalImageFiles={additionalImageFiles}
                    setAdditionalImageFiles={setAdditionalImageFiles}
                    existingAdditionalImageIds={existingAdditionalImageIds}
                    setExistingAdditionalImageIds={setExistingAdditionalImageIds}

                    inputClass={inputClass}
                    labelClass={labelClass}
                    sectionClass={sectionClass}
                    fileInputClass={fileInputClass}
                />
            )}

            {/* ====================================================
                STANDALONE PRODUCT LISTING FORM
            ==================================================== */}
            {isListing && (
                <ListingForm
                    sectionClass={sectionClass}
                    labelClass={labelClass}
                    inputClass={inputClass}
                    fileInputClass={fileInputClass}

                    selectedPart={selectedPart}
                    renderPartSelector={renderPartSelector}

                    listingConditionId={listingConditionId}
                    setListingConditionId={setListingConditionId}
                    renderConditionSelector={renderConditionSelector}

                    listingPriceMode={listingPriceMode}
                    setListingPriceMode={setListingPriceMode}
                    listingPrice={listingPrice}
                    setListingPrice={setListingPrice}
                    renderListingPricing={renderListingPricing}

                    listingShortDescription={listingShortDescription}
                    setListingShortDescription={setListingShortDescription}
                    listingLongDescription={listingLongDescription}
                    setListingLongDescription={setListingLongDescription}

                    listingSeoTitle={listingSeoTitle}
                    setListingSeoTitle={setListingSeoTitle}
                    listingMetaDescription={listingMetaDescription}
                    setListingMetaDescription={setListingMetaDescription}
                    listingSearchTerms={listingSearchTerms}
                    setListingSearchTerms={setListingSearchTerms}

                    isListingEditing={isListingEditing}
                    editingListing={editingListing}

                    listingImageFile={listingImageFile}
                    listingImageRemoved={listingImageRemoved}
                    setListingImageRemoved={setListingImageRemoved}
                    handleListingImageChange={handleListingImageChange}

                    listingAdditionalImageFiles={listingAdditionalImageFiles}
                    setListingAdditionalImageFiles={setListingAdditionalImageFiles}
                    existingListingAdditionalImageIds={existingListingAdditionalImageIds}
                    setExistingListingAdditionalImageIds={
                        setExistingListingAdditionalImageIds
                    }
                />
            )}


            <SaveCancelButtons
                handleCancel={handleCancel}
                handleSubmit={handleSubmit}
                loading={loading}
                creatingPart={creatingPart}
                creatingListing={creatingListing}
                missingFields={missingFields}
                isEditing={isEditing}
                isProduct={isProduct}
                isPart={isPart}
            />
        </div>
    );
};

export default InventoryForm;
