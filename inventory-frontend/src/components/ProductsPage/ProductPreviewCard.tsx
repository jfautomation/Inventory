
import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react";

import type { Product, Part } from "../../types";
import type { Term } from "../../types";
import ConditionPill from "../UI/ConditionPill";

type ProductPreviewCardProps = {
    product: Product;
    parts: Part[];
    categories: Term[];
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
};

const createSlug = (value: string | number | null | undefined) =>
    String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "product";

export default function ProductPreviewCard({
    product,
    parts,
    categories,
    onEdit,
    onDelete,
}: ProductPreviewCardProps) {
    const [imageFailed, setImageFailed] = useState(false);

    const part = product.part?.[0];

    const fullPart = part
        ? parts.find((item) => Number(item.id) === Number(part.id))
        : undefined;

    const category = categories.find(
        (item) => Number(item.id) === Number(fullPart?.category_id)
    );

    const imageAvailable = Boolean(product.image) && !imageFailed;

    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5 transition hover:border-gray-300 hover:bg-gray-50">

            {/* Product image */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                {imageAvailable ? (
                    <img
                        src={product.image}
                        alt={product.title}
                        onError={() => setImageFailed(true)}
                        className="h-full w-full object-contain p-1"
                    />
                ) : (
                    <ImageIcon size={22} className="text-gray-300" />
                )}
            </div>

            {/* Product information */}
            <div className="min-w-0 flex-1">

                <Link
                    to={`/products/${product.id}/${createSlug(
                        product.title || `product-${product.id}`
                    )}`}
                    onClick={(e) => e.stopPropagation()}
                    title={product.title}
                    className="block truncate text-sm font-semibold text-gray-900 hover:text-[#3F76ED] hover:underline"
                >
                    {product.title || "-"}
                </Link>

                <div className="mt-0.5 truncate text-xs text-gray-500">
                    {fullPart?.part_number || fullPart?.name || "No part number"}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                    {product.condition?.[0]?.name && (
                        <ConditionPill condition={product.condition[0].name} />
                    )}

                    {product.brand?.[0]?.name && (
                        <span className="text-xs text-gray-500">
                            {product.brand[0].name}
                        </span>
                    )}

                    {category?.name && (
                        <span className="text-xs text-gray-400">
                            · {category.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Price and actions */}
            <div className="flex shrink-0 items-center gap-2">

                <div className="text-right">
                    <div className="whitespace-nowrap text-sm font-semibold text-gray-900">
                        {product.list_price != null
                            ? `$${Number(product.list_price).toLocaleString()}`
                            : "-"}
                    </div>

                    {product.quantity != null && (
                        <div className="text-xs text-gray-500">
                            Qty: {product.quantity}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onEdit(product)}
                        title="Edit product"
                        aria-label={`Edit ${product.title}`}
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Pencil size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(product)}
                        title="Delete product"
                        aria-label={`Delete ${product.title}`}
                        className="rounded-md p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>

            </div>
        </div>
    );
}
