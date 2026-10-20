import { Link } from "react-router-dom";
import DetailRow from "./DetailRow";

type DetailCardProps = {
  product?: any;
  part?: any;
  brand?: any;
  category?: any;
};

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border-b border-gray-100 py-3">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="break-words text-sm font-medium text-gray-900">
        {value || "-"}
      </div>
    </div>
  );
}

function TextSection({
  title,
  value,
}: {
  title: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2 text-sm font-semibold text-gray-800">
        {title}
      </h3>
      {value ? (
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
          {value}
        </p>
      ) : (
        <p className="text-sm italic text-gray-400">
          No {title.toLowerCase()} added.
        </p>
      )}
    </div>
  );
}

export default function DetailCard({
  product,
  part,
  brand,
  category,
}: DetailCardProps) {
  const isPart = !!part;

  const fields = isPart
    ? [
      { label: "Part Number", value: part.part_number || "-" },
      { label: "Brand", value: brand?.name || "-" },
      { label: "Category", value: category?.name || "-" },
      {
        label: "Base Price",
        value:
          part.base_price != null
            ? `$${Number(part.base_price).toLocaleString()}`
            : "-",
      },
    ]
    : [
      { label: "Brand", value: product.brand?.[0]?.name || "-" },
      {
        label: "Part",
        value: product.part?.[0] ? (
          <Link
            to={`/part/${product.part[0].id}`}
            className="font-medium text-blue-600 hover:underline"
          >
            {product.part[0].name}
          </Link>
        ) : "-",
      },
      {
        label: "Category",
        value: product.inventory_category?.[0]?.name || "-",
      },
      { label: "Serial Number", value: product.serial_number || "-" },
      {
        label: "Condition",
        value: product.condition?.[0]?.name || "-",
      },
      {
        label: "List Price",
        value:
          product.list_price != null
            ? `$${Number(product.list_price).toLocaleString()}`
            : "-",
      },
      { label: "Work Order", value: product.work_order || "-" },
    ];

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      {/* Title */}
      <div className="mb-3">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
          {isPart ? "Part name" : "Title"}
        </div>
        <h2 className="break-words text-lg font-semibold leading-snug text-gray-900 sm:text-xl">
          {isPart ? part.name || "-" : product.title || "-"}
        </h2>
      </div>

      {/* Main fields */}
      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.label}
            label={field.label}
            value={field.value}
          />
        ))}
      </div>

      {/* Description and notes */}
      <div className="mt-5 grid grid-cols-1 gap-5 border-t border-gray-200 pt-5 sm:grid-cols-2">
        <TextSection
          title="Short description"
          value={isPart ? part.short_description : product.short_description}
        />

        {!isPart && (
          <TextSection
            title="Notes"
            value={product.notes}
          />
        )}
      </div>
      <div className="mt-5 border-t border-gray-200 pt-5">
        <TextSection
          title="Long description"
          value={isPart ? part.long_description : product.long_description}
        />
      </div>
    </div>
  );
}
