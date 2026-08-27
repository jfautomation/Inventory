import { Search } from "lucide-react";

import Input from "../../UI/Input/Input";
import { useInventory } from "../../../context/InventoryContext";


// ============================================================
// TYPES
// ============================================================

type InventoryFiltersProps = {
    entityName?: string;
};


// ============================================================
// COMPONENT
// ============================================================

export default function InventoryFilters({
    entityName,
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
                mb-6
            "
        >

            {/* ==================================================
                SEARCH
            ================================================== */}

            <div className="flex-1">

                <Input
                    placeholder={`Search ${entityName || "inventory"}...`}
                    icon={<Search size={18} />}
                    className="w-full"
                />

            </div>


            {/* ==================================================
                CATEGORY
            ================================================== */}

            <select
                className="
                    w-44
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-2
                    bg-white
                "
                defaultValue=""
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
                className="
                    w-44
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-2
                    bg-white
                "
                defaultValue=""
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


            {/* ==================================================
                SHELF
            ================================================== */}

            <select
                className="
                    w-44
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-2
                    bg-white
                "
                defaultValue=""
            >

                <option value="">
                    Shelf
                </option>

                {shelves.map((shelf) => (

                    <option
                        key={shelf.id}
                        value={shelf.id}
                    >
                        {shelf.name}
                    </option>

                ))}

            </select>


            {/* ==================================================
                CONDITION
            ================================================== */}

            <select
                className="
                    w-44
                    border
                    border-gray-300
                    rounded-lg
                    px-4
                    py-2
                    bg-white
                "
                defaultValue=""
            >

                <option value="">
                    Condition
                </option>

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
    );
}