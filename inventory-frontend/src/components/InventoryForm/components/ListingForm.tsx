import React from "react";
import type { Part } from "../../../types";

interface ListingFormProps {
    sectionClass: string;

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
}

export default function ListingForm({
    sectionClass,
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
        </>
    );
}