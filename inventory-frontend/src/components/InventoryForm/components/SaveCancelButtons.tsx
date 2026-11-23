interface SaveCancelButtonsProps {
    handleCancel: () => void;
    handleSubmit: () => void;
    loading: boolean;
    creatingPart: boolean;
    creatingListing: boolean;
    missingFields: string[];
    isEditing: boolean;
    isProduct: boolean;
    isPart: boolean;
}

export default function SaveCancelButtons({
    handleCancel,
    handleSubmit,
    loading,
    creatingPart,
    creatingListing,
    missingFields,
    isEditing,
    isProduct,
    isPart,
}: SaveCancelButtonsProps) {
    return (
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
    );
}