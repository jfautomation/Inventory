
import React from "react";
import type { Part, ProductListing } from "../../../types";

interface ListingFormProps {
    sectionClass: string;
    labelClass: string;
    inputClass: string;
    fileInputClass: string;

    selectedPart: Part | null;
    renderPartSelector: () => React.ReactNode;

    listingConditionId: number | "";
    setListingConditionId: React.Dispatch<
        React.SetStateAction<number | "">
    >;
    renderConditionSelector: (
        value: number | "",
        setter: React.Dispatch<React.SetStateAction<number | "">>
    ) => React.ReactNode;

    listingPriceMode: "automatic" | "manual";
    setListingPriceMode: React.Dispatch<
        React.SetStateAction<"automatic" | "manual">
    >;
    listingPrice: string;
    setListingPrice: (value: string) => void;
    renderListingPricing: (
        priceMode: "automatic" | "manual",
        setPriceMode: (
            value: "automatic" | "manual"
        ) => void,
        price: string,
        setPrice: (value: string) => void
    ) => React.ReactNode;

    listingShortDescription: string;
    setListingShortDescription: (value: string) => void;
    listingLongDescription: string;
    setListingLongDescription: (value: string) => void;

    listingSeoTitle: string;
    setListingSeoTitle: (value: string) => void;
    listingMetaDescription: string;
    setListingMetaDescription: (value: string) => void;
    listingSearchTerms: string;
    setListingSearchTerms: (value: string) => void;

    isListingEditing: boolean;
    editingListing: ProductListing | null;

    listingImageFile: File | null;
    listingImageRemoved: boolean;
    setListingImageRemoved: (removed: boolean) => void;
    handleListingImageChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;

    listingAdditionalImageFiles: File[];
    setListingAdditionalImageFiles: React.Dispatch<
        React.SetStateAction<File[]>
    >;
    existingListingAdditionalImageIds: number[];
    setExistingListingAdditionalImageIds: (
        ids: number[]
    ) => void;
}

export default function ListingForm({
    sectionClass,
    labelClass,
    inputClass,
    fileInputClass,

    selectedPart,
    renderPartSelector,

    listingConditionId,
    setListingConditionId,
    renderConditionSelector,

    listingPriceMode,
    setListingPriceMode,
    listingPrice,
    setListingPrice,
    renderListingPricing,

    listingShortDescription,
    setListingShortDescription,
    listingLongDescription,
    setListingLongDescription,

    listingSeoTitle,
    setListingSeoTitle,
    listingMetaDescription,
    setListingMetaDescription,
    listingSearchTerms,
    setListingSearchTerms,

    isListingEditing,
    editingListing,

    listingImageFile,
    listingImageRemoved,
    setListingImageRemoved,
    handleListingImageChange,

    listingAdditionalImageFiles,
    setListingAdditionalImageFiles,
    existingListingAdditionalImageIds,
    setExistingListingAdditionalImageIds,
}: ListingFormProps) {
    return (
        <>
            {/* PART */}
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

            {/* LISTING DETAILS */}
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

            {/* DESCRIPTIONS */}
            <section className={sectionClass}>
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Descriptions
                </h3>

                <div className="space-y-5">
                    <div>
                        <label className={labelClass}>
                            Short Description
                        </label>

                        <textarea
                            value={listingShortDescription}
                            onChange={(e) =>
                                setListingShortDescription(e.target.value)
                            }
                            rows={3}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Long Description
                        </label>

                        <textarea
                            value={listingLongDescription}
                            onChange={(e) =>
                                setListingLongDescription(e.target.value)
                            }
                            rows={6}
                            className={inputClass}
                        />
                    </div>
                </div>
            </section>

            {/* SEO */}
            <section className={sectionClass}>
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    SEO Information
                </h3>

                <div className="space-y-5">
                    <div>
                        <label className={labelClass}>SEO Title</label>

                        <input
                            type="text"
                            value={listingSeoTitle}
                            onChange={(e) =>
                                setListingSeoTitle(e.target.value)
                            }
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Meta Description</label>

                        <textarea
                            value={listingMetaDescription}
                            onChange={(e) =>
                                setListingMetaDescription(e.target.value)
                            }
                            rows={3}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>
                            Search Terms / Keywords
                        </label>

                        <textarea
                            value={listingSearchTerms}
                            onChange={(e) =>
                                setListingSearchTerms(e.target.value)
                            }
                            rows={2}
                            className={inputClass}
                        />
                    </div>
                </div>
            </section>

            {/* MAIN IMAGE */}
            <section className={sectionClass}>
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Product Image
                </h3>

                {isListingEditing &&
                    editingListing?.image_url &&
                    !listingImageRemoved &&
                    !listingImageFile && (
                        <div className="mb-4">
                            <img
                                src={editingListing.image_url}
                                alt="Current product"
                                className="h-32 w-32 rounded-lg border border-gray-200 object-contain"
                            />

                            <button
                                type="button"
                                onClick={() => setListingImageRemoved(true)}
                                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
                            >
                                Remove current image
                            </button>
                        </div>
                    )}

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleListingImageChange}
                    className={fileInputClass}
                />

                {listingImageFile && (
                    <p className="mt-2 text-sm text-gray-500">
                        Selected: {listingImageFile.name}
                    </p>
                )}
            </section>

            {/* ADDITIONAL IMAGES */}
            <section className={sectionClass}>
                <h3 className="mb-4 text-base font-semibold text-gray-900">
                    Additional Images
                </h3>

                {existingListingAdditionalImageIds.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                            Existing additional images
                        </p>

                        {existingListingAdditionalImageIds.map((imageId) => (
                            <div
                                key={imageId}
                                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                            >
                                <span className="text-sm text-gray-600">
                                    Image #{imageId}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setExistingListingAdditionalImageIds(
                                            existingListingAdditionalImageIds.filter(
                                                (id) => id !== imageId
                                            )
                                        )
                                    }
                                    className="text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);

                        setListingAdditionalImageFiles((current) => [
                            ...current,
                            ...files,
                        ]);

                        e.target.value = "";
                    }}
                    className={fileInputClass}
                />

                {listingAdditionalImageFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {listingAdditionalImageFiles.map((file, index) => (
                            <div
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
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
                                    className="ml-3 text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
