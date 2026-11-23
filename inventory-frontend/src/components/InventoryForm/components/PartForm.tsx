import React from "react";
import type { Part, Term } from "../../../types";

interface PartFormProps {
    isPartEditing: boolean;
    editingPart: Part | null;
    initialBrand: Term | null;
    brands: Term[];
    categories: Term[];

    selectedBrand: Term | null;
    setSelectedBrand: React.Dispatch<React.SetStateAction<Term | null>>;
    selectedCategory: Term | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<Term | null>>;
    selectedSeries: Term | null;
    setSelectedSeries: React.Dispatch<React.SetStateAction<Term | null>>;

    partName: string;
    setPartName: React.Dispatch<React.SetStateAction<string>>;
    partNumber: string;
    setPartNumber: React.Dispatch<React.SetStateAction<string>>;
    partBasePrice: string;
    setPartBasePrice: React.Dispatch<React.SetStateAction<string>>;

    shortDescription: string;
    setShortDescription: React.Dispatch<React.SetStateAction<string>>;
    longDescription: string;
    setLongDescription: React.Dispatch<React.SetStateAction<string>>;

    seoTitle: string;
    setSeoTitle: React.Dispatch<React.SetStateAction<string>>;
    metaDescription: string;
    setMetaDescription: React.Dispatch<React.SetStateAction<string>>;
    searchTerms: string;
    setSearchTerms: React.Dispatch<React.SetStateAction<string>>;

    availableSeries: Term[];

    partImageFile: File | null;
    partImageRemoved: boolean;
    setPartImageFile: React.Dispatch<React.SetStateAction<File | null>>;
    setPartImageRemoved: React.Dispatch<React.SetStateAction<boolean>>;
    handlePartImageChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;

    additionalImageFiles: File[];
    setAdditionalImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
    existingAdditionalImageIds: number[];
    setExistingAdditionalImageIds: React.Dispatch<
        React.SetStateAction<number[]>
    >;

    inputClass: string;
    labelClass: string;
    sectionClass: string;
    fileInputClass: string;
}

const PartForm: React.FC<PartFormProps> = ({
    isPartEditing,
    editingPart,
    initialBrand,
    brands,
    categories,

    selectedBrand,
    setSelectedBrand,
    selectedCategory,
    setSelectedCategory,
    selectedSeries,
    setSelectedSeries,

    partName,
    setPartName,
    partNumber,
    setPartNumber,
    partBasePrice,
    setPartBasePrice,

    shortDescription,
    setShortDescription,
    longDescription,
    setLongDescription,

    seoTitle,
    setSeoTitle,
    metaDescription,
    setMetaDescription,
    searchTerms,
    setSearchTerms,

    availableSeries,

    partImageFile,
    partImageRemoved,
    setPartImageFile,
    setPartImageRemoved,
    handlePartImageChange,

    additionalImageFiles,
    setAdditionalImageFiles,
    existingAdditionalImageIds,
    setExistingAdditionalImageIds,

    inputClass,
    labelClass,
    sectionClass,
    fileInputClass,
}) => {
    return (
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
    );
};

export default PartForm;