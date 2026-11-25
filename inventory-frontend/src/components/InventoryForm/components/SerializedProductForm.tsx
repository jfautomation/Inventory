import React from "react";
import type { Product, Part, ProductListing, Term } from "../../../types";

type SerializedProductFormProps = {
    isProduct: boolean;
    isProductEditing: boolean;
    editingProduct: Product | null;

    brands: Term[];
    categories: Term[];
    conditions: Term[];
    shelves: Term[];

    selectedPart: Part | null;
    selectedListingId: number | "";
    selectedListing: ProductListing | null;
    listingsForSelectedPart: ProductListing[];
    setSelectedListingId: React.Dispatch<React.SetStateAction<number | "">>;

    serialNumber: string;
    setSerialNumber: React.Dispatch<React.SetStateAction<string>>;
    workOrder: string;
    setWorkOrder: React.Dispatch<React.SetStateAction<string>>;
    inventoryStatus: "active" | "sold" | "archived";
    setInventoryStatus: React.Dispatch<
        React.SetStateAction<"active" | "sold" | "archived">
    >;

    selectedShelf: Term | null;
    setSelectedShelf: React.Dispatch<React.SetStateAction<Term | null>>;
    testStatus: boolean | null;
    setTestStatus: React.Dispatch<React.SetStateAction<boolean | null>>;
    testDate: string;
    setTestDate: React.Dispatch<React.SetStateAction<string>>;
    notes: string;
    setNotes: React.Dispatch<React.SetStateAction<string>>;

    productImageFile: File | null;
    productImageRemoved: boolean;
    setProductImageFile: React.Dispatch<React.SetStateAction<File | null>>;
    setProductImageRemoved: React.Dispatch<React.SetStateAction<boolean>>;

    showCreatePart: boolean;
    setShowCreatePart: React.Dispatch<React.SetStateAction<boolean>>;
    creatingPart: boolean;
    newPartName: string;
    setNewPartName: React.Dispatch<React.SetStateAction<string>>;
    newPartNumber: string;
    setNewPartNumber: React.Dispatch<React.SetStateAction<string>>;
    newPartBrandId: number | "";
    setNewPartBrandId: React.Dispatch<React.SetStateAction<number | "">>;
    newPartCategoryId: number | "";
    setNewPartCategoryId: React.Dispatch<React.SetStateAction<number | "">>;
    newPartSeriesId: number | "";
    setNewPartSeriesId: React.Dispatch<React.SetStateAction<number | "">>;
    newPartBasePrice: string;
    setNewPartBasePrice: React.Dispatch<React.SetStateAction<string>>;
    newPartShortDescription: string;
    setNewPartShortDescription: React.Dispatch<React.SetStateAction<string>>;
    newPartLongDescription: string;
    setNewPartLongDescription: React.Dispatch<React.SetStateAction<string>>;
    availablePartSeries: Term[];
    handleCreatePart: () => void;

    showCreateListing: boolean;
    setShowCreateListing: React.Dispatch<React.SetStateAction<boolean>>;
    creatingListing: boolean;
    newListingConditionId: number | "";
    setNewListingConditionId: React.Dispatch<React.SetStateAction<number | "">>;
    newListingPriceMode: "automatic" | "manual";
    setNewListingPriceMode: React.Dispatch<
        React.SetStateAction<"automatic" | "manual">
    >;
    newListingPrice: string;
    setNewListingPrice: React.Dispatch<React.SetStateAction<string>>;
    handleCreateListing: () => void;

    renderPartSelector: () => React.ReactNode;
    renderConditionSelector: (
        value: number | "",
        onChange: (value: number | "") => void
    ) => React.ReactNode;
    renderListingPricing: (
        priceMode: "automatic" | "manual",
        setPriceMode: (value: "automatic" | "manual") => void,
        price: string,
        setPrice: (value: string) => void
    ) => React.ReactNode;
    handleProductImageChange: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => void;
};

const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";
const sectionClass = "mt-7 border-t border-gray-200 pt-6";

const buttonClass =
    "rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

const fileInputClass =
    "block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700";

const SerializedProductForm: React.FC<SerializedProductFormProps> = (props) => {
    const {
        isProduct,
        isProductEditing,
        editingProduct,
        brands,
        categories,
        conditions,
        shelves,
        selectedPart,
        selectedListingId,
        selectedListing,
        listingsForSelectedPart,
        setSelectedListingId,
        serialNumber,
        setSerialNumber,
        workOrder,
        setWorkOrder,
        inventoryStatus,
        setInventoryStatus,
        selectedShelf,
        setSelectedShelf,
        testStatus,
        setTestStatus,
        testDate,
        setTestDate,
        notes,
        setNotes,
        productImageFile,
        productImageRemoved,
        setProductImageFile,
        setProductImageRemoved,
        showCreatePart,
        setShowCreatePart,
        creatingPart,
        newPartName,
        setNewPartName,
        newPartNumber,
        setNewPartNumber,
        newPartBrandId,
        setNewPartBrandId,
        newPartCategoryId,
        setNewPartCategoryId,
        newPartSeriesId,
        setNewPartSeriesId,
        newPartBasePrice,
        setNewPartBasePrice,
        newPartShortDescription,
        setNewPartShortDescription,
        newPartLongDescription,
        setNewPartLongDescription,
        availablePartSeries,
        handleCreatePart,
        showCreateListing,
        setShowCreateListing,
        creatingListing,
        newListingConditionId,
        setNewListingConditionId,
        newListingPriceMode,
        setNewListingPriceMode,
        newListingPrice,
        setNewListingPrice,
        handleCreateListing,
        renderPartSelector,
        renderConditionSelector,
        renderListingPricing,
        handleProductImageChange,
    } = props;

    return (
        <>
            {isProduct && (
                <>
                    {/* PART */}
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
                                        <label className={labelClass}>
                                            Part Name *
                                        </label>
                                        <input
                                            value={newPartName}
                                            onChange={(event) =>
                                                setNewPartName(event.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>
                                            Part Number *
                                        </label>
                                        <input
                                            value={newPartNumber}
                                            onChange={(event) =>
                                                setNewPartNumber(event.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Brand *</label>
                                        <select
                                            value={newPartBrandId}
                                            onChange={(event) => {
                                                setNewPartBrandId(
                                                    event.target.value
                                                        ? Number(event.target.value)
                                                        : ""
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
                                        <label className={labelClass}>
                                            Category *
                                        </label>
                                        <select
                                            value={newPartCategoryId}
                                            onChange={(event) =>
                                                setNewPartCategoryId(
                                                    event.target.value
                                                        ? Number(event.target.value)
                                                        : ""
                                                )
                                            }
                                            className={inputClass}
                                        >
                                            <option value="">Select Category</option>
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

                                    <div>
                                        <label className={labelClass}>Series</label>
                                        <select
                                            value={newPartSeriesId}
                                            disabled={!newPartBrandId}
                                            onChange={(event) =>
                                                setNewPartSeriesId(
                                                    event.target.value
                                                        ? Number(event.target.value)
                                                        : ""
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
                                        <label className={labelClass}>
                                            Base Price
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={newPartBasePrice}
                                            onChange={(event) =>
                                                setNewPartBasePrice(event.target.value)
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>
                                            Short Description
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={newPartShortDescription}
                                            onChange={(event) =>
                                                setNewPartShortDescription(
                                                    event.target.value
                                                )
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={labelClass}>
                                            Long Description
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={newPartLongDescription}
                                            onChange={(event) =>
                                                setNewPartLongDescription(
                                                    event.target.value
                                                )
                                            }
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
                                        {creatingPart
                                            ? "Creating Part..."
                                            : "Create Part"}
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

                    {/* PRODUCT LISTING */}
                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            2. Product Listing
                        </h3>

                        <div>
                            <label className={labelClass}>
                                Product Listing{" "}
                                <span className="text-red-500">*</span>
                            </label>

                            <select
                                value={selectedListingId}
                                disabled={!selectedPart || isProductEditing}
                                onChange={(event) =>
                                    setSelectedListingId(
                                        event.target.value
                                            ? Number(event.target.value)
                                            : ""
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
                                            Number(item.id) ===
                                            Number(listing.condition_id)
                                    );

                                    return (
                                        <option
                                            key={listing.id}
                                            value={listing.id}
                                        >
                                            {listing.title} —{" "}
                                            {condition?.name || "Condition"} — SKU:{" "}
                                            {listing.sku}
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
                                        <span className="text-gray-500">
                                            Condition
                                        </span>
                                        <p className="font-medium text-gray-900">
                                            {conditions.find(
                                                (item) =>
                                                    Number(item.id) ===
                                                    Number(selectedListing.condition_id)
                                            )?.name || "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-500">
                                            Listing Price
                                        </span>
                                        <p className="font-medium text-gray-900">
                                            {selectedListing.list_price != null
                                                ? `$${Number(
                                                      selectedListing.list_price
                                                  ).toFixed(2)}`
                                                : "—"}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-500">
                                            Available Quantity
                                        </span>
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
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        disabled={creatingListing}
                                        onClick={handleCreateListing}
                                        className={buttonClass}
                                    >
                                        {creatingListing
                                            ? "Creating Listing..."
                                            : "Create Product Listing"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* SERIALIZED PRODUCT DETAILS */}
                    <section className={sectionClass}>
                        <h3 className="mb-4 text-base font-semibold text-gray-900">
                            3. Serialized Product Details
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Serial Number{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={serialNumber}
                                    onChange={(event) =>
                                        setSerialNumber(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Enter serial number"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Work Order</label>
                                <input
                                    value={workOrder}
                                    onChange={(event) =>
                                        setWorkOrder(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Enter work order"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Inventory Status
                                </label>
                                <select
                                    value={inventoryStatus}
                                    onChange={(event) =>
                                        setInventoryStatus(
                                            event.target.value as
                                                | "active"
                                                | "sold"
                                                | "archived"
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
                                                (item) =>
                                                    item.id ===
                                                    Number(event.target.value)
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

                    {/* TESTING */}
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
                                            setTestStatus(
                                                event.target.value === "passed"
                                            );
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
                                    onChange={(event) =>
                                        setTestDate(event.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </section>

                    {/* ADDITIONAL INFORMATION */}
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
                                    onChange={(event) =>
                                        setNotes(event.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Enter notes about this individual unit..."
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Serialized Product Image
                                </label>
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
        </>
    );
};

export default SerializedProductForm;