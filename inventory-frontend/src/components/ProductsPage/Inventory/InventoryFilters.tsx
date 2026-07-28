import Input from "../../UI/Input/Input";
import { Search } from "lucide-react";

<Search size={18} />

type InventoryFiltersProps = {
    entityName: string;
};


export default function InventoryFilters({
    entityName,
}: InventoryFiltersProps) {


    return (
        <div
            className="
        flex
        items-center
        gap-4
        mb-6
      "
        >

            {/* Search */}
            <div className="flex-1">
                <Input
                    placeholder="Search products..."
                    icon={<Search size={18} />}
                    className="w-full"
                />
            </div>

            {/* Part Type */}
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
            >
                <option>Part Type</option>
                <option>Product</option>
                <option>Component</option>
            </select>

            {/* Brand */}
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
            >
                <option>Brand</option>
                <option>Siemens</option>
                <option>Allen Bradley</option>
            </select>

            {/* Status */}
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
            >
                <option>Status</option>
                <option>In Stock</option>
                <option>Low Stock</option>
            </select>

        </div>
    );
}