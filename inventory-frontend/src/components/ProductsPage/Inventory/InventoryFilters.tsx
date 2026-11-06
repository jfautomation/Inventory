
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

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
  const { brands, categories } = useInventory();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] =
    useState(false);

  const activeFilterCount =
    Number(Boolean(categoryValue)) +
    Number(Boolean(brandValue));

  return (
    <div className="w-full min-w-0">

      {/* ==================================================
          DESKTOP FILTERS (1000px AND ABOVE)
      ================================================== */}

      <div className="
        hidden min-w-0 items-center gap-4
        min-[1000px]:flex
      ">

        {/* SEARCH */}
        <div className="min-w-0 flex-1">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${entityName || "inventory"}...`}
            icon={<Search size={16} />}
            className="w-full text-sm"
          />
        </div>

        {/* CATEGORY */}
        <select
          value={categoryValue}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="
            w-44 shrink-0 rounded-lg border border-gray-300
            bg-white px-4 py-2 text-sm
            focus:border-[#3F76ED] focus:outline-none
            focus:ring-2 focus:ring-[#3F76ED]/15
          "
        >
          <option value="">Category</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* BRAND */}
        <select
          value={brandValue}
          onChange={(e) => onBrandChange(e.target.value)}
          className="
            w-44 shrink-0 rounded-lg border border-gray-300
            bg-white px-4 py-2 text-sm
            focus:border-[#3F76ED] focus:outline-none
            focus:ring-2 focus:ring-[#3F76ED]/15
          "
        >
          <option value="">Brand</option>

          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>

        {/* CLEAR FILTERS */}
        <button
          type="button"
          onClick={onClearFilters}
          className="
            shrink-0 rounded-lg border border-[#3F76ED]
            bg-white px-4 py-2 text-sm font-medium
            text-[#3F76ED] transition hover:bg-blue-50
          "
        >
          Clear Filters
        </button>
      </div>

      {/* ==================================================
          MOBILE / TABLET FILTERS (BELOW 1000px)
      ================================================== */}

      <div className="
        flex min-w-0 flex-col gap-3
        min-[1000px]:hidden
      ">

        {/* FULL-WIDTH SEARCH */}
        <div className="w-full min-w-0">
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${entityName || "inventory"}...`}
            icon={<Search size={16} />}
            className="w-full text-sm"
          />
        </div>

        {/* FILTER BUTTON */}
        <div className="flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={() =>
              setIsMobileFiltersOpen((prev) => !prev)
            }
            aria-expanded={isMobileFiltersOpen}
            className="
              flex items-center gap-2 rounded-lg
              border border-gray-300 bg-white
              px-4 py-2.5 text-sm font-medium text-gray-700
              transition hover:bg-gray-50
            "
          >
            <SlidersHorizontal size={16} />

            Filters

            {activeFilterCount > 0 && (
              <span className="
                flex h-5 min-w-5 items-center justify-center
                rounded-full bg-[#3F76ED] px-1.5
                text-xs font-semibold text-white
              ">
                {activeFilterCount}
              </span>
            )}

            <ChevronDown
              size={16}
              className={`
                transition-transform
                ${isMobileFiltersOpen ? "rotate-180" : ""}
              `}
            />
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="
                text-sm font-medium text-[#3F76ED]
                transition hover:text-blue-700
              "
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* COLLAPSIBLE FILTER PANEL */}
        {isMobileFiltersOpen && (
          <div className="
            grid grid-cols-1 gap-3 rounded-lg
            border border-gray-200 bg-gray-50 p-3
            sm:grid-cols-2
          ">

            {/* CATEGORY */}
            <div className="min-w-0">
              <label className="
                mb-1.5 block text-xs font-medium text-gray-600
              ">
                Category
              </label>

              <select
                value={categoryValue}
                onChange={(e) =>
                  onCategoryChange(e.target.value)
                }
                className="
                  w-full rounded-lg border border-gray-300
                  bg-white px-3 py-2.5 text-sm
                  focus:border-[#3F76ED] focus:outline-none
                  focus:ring-2 focus:ring-[#3F76ED]/15
                "
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* BRAND */}
            <div className="min-w-0">
              <label className="
                mb-1.5 block text-xs font-medium text-gray-600
              ">
                Brand
              </label>

              <select
                value={brandValue}
                onChange={(e) =>
                  onBrandChange(e.target.value)
                }
                className="
                  w-full rounded-lg border border-gray-300
                  bg-white px-3 py-2.5 text-sm
                  focus:border-[#3F76ED] focus:outline-none
                  focus:ring-2 focus:ring-[#3F76ED]/15
                "
              >
                <option value="">All Brands</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

