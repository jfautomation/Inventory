import { Search } from "lucide-react";

import Input from "../../UI/Input/Input";
import { useInventory } from "../../../context/InventoryContext";


// ============================================================
// TYPES
// ============================================================

type InventoryFiltersProps = {
    entityName?: string;

    searchValue: string;
    onSearchChange: (value: string) => void;

    categoryValue: string;
    onCategoryChange: (value: string) => void;

    brandValue: string;
    onBrandChange: (value: string) => void;

    onClearFilters: () => void;
};


// ============================================================
// COMPONENT
// ============================================================

export default function InventoryFilters({
    entityName,
    searchValue,
    onSearchChange,
    categoryValue,
    onCategoryChange,
    brandValue,
    onBrandChange,
    onClearFilters,
}: InventoryFiltersProps) {

    const {
        brands,
        categories,
        shelves,
        conditions,
    } = useInventory();


    return (
        <div
            className="
                flex
                items-center
                gap-4
                
            "
        >

            {/* ==================================================
                SEARCH
            ================================================== */}

            <div className="flex-1">

                <Input
                    value={searchValue}
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                    placeholder={`Search ${entityName || "inventory"}...`}
                    icon={<Search size={16}/>}
                    className="w-full text-sm"
                />

            </div>


            {/* ==================================================
                CATEGORY
            ================================================== */}

            <select
                value={categoryValue}
                onChange={(e) => {
                    onCategoryChange(e.target.value);
                }}
                className="
                    w-44
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-2
                    bg-white
                    text-sm
                    "
            >

                <option value="">
                    Category
                </option>

                {categories.map((category) => (

                    <option
                        key={category.id}
                        value={category.id}
                    >
                        {category.name}
                    </option>

                ))}

            </select>


            {/* ==================================================
                BRAND
            ================================================== */}

            <select
                value={brandValue}
                onChange={(e) => {
                    onBrandChange(e.target.value);
                }}

                className="
                    w-44
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-2
                    bg-white
                    text-sm
                "
            >

                <option value="">
                    Brand
                </option>

                {brands.map((brand) => (

                    <option
                        key={brand.id}
                        value={brand.id}
                    >
                        {brand.name}
                    </option>

                ))}

            </select>




            <button
                type="button"
                onClick={onClearFilters}
                className="
    px-4
    py-2
    border
    border-[#3F76ED]
    rounded-lg
    bg-white
    text-sm
    font-medium
    text-[#3F76ED]
    hover:bg-blue-50
    transition
  "
            >
                Clear Filters
            </button>

        </div>
    );
}

