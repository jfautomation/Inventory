import { Pencil } from "lucide-react";

import type { StockSummaryRow } from "../../services/StockSummaryService";
import ConditionPill from "../UI/ConditionPill";

type StockSummaryPreviewCardProps = {
  row: StockSummaryRow;
  editingId: number | null;
  draftSku: string;
  savingId: number | null;
  onStartEditing: (row: StockSummaryRow) => void;
  onDraftChange: (value: string) => void;
  onSave: (variantId: number) => void;
  onCancel: () => void;
};

export default function StockSummaryPreviewCard({
  row,
  editingId,
  draftSku,
  savingId,
  onStartEditing,
  onDraftChange,
  onSave,
  onCancel,
}: StockSummaryPreviewCardProps) {
  const isEditing = editingId === row.id;
  const isSaving = savingId === row.id;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-gray-300 hover:bg-gray-50">

      {/* Part information */}
      <div className="min-w-0 flex-1">
        <div
          title={row.part_name}
          className="truncate text-sm font-semibold text-gray-900"
        >
          {row.part_name}
        </div>

        <div className="mt-1">
          {row.condition_name ? (
            <ConditionPill condition={row.condition_name} />
          ) : (
            <span className="text-xs text-gray-400">No condition</span>
          )}
        </div>

        {/* SKU */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <input
                type="text"
                inputMode="numeric"
                maxLength={7}
                value={draftSku}
                disabled={isSaving}
                onChange={(event) =>
                  onDraftChange(
                    event.target.value.replace(/\D/g, "").slice(0, 7)
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onSave(row.id);
                  }

                  if (event.key === "Escape") {
                    onCancel();
                  }
                }}
                aria-label={`SKU for ${row.part_name}, ${row.condition_name}`}
                className="w-28 rounded-md border border-blue-300 bg-white px-2 py-1.5 text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                autoFocus
              />

              <button
                type="button"
                onClick={() => onSave(row.id)}
                disabled={isSaving}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-mono text-gray-500">
                SKU: {row.sku || "—"}
              </span>

              <button
                type="button"
                onClick={() => onStartEditing(row)}
                disabled={editingId !== null}
                title="Edit SKU"
                aria-label={`Edit SKU for ${row.part_name}`}
                className="rounded-md p-1 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Pencil size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Available quantity */}
      <div className="shrink-0 border-l border-gray-100 pl-3 text-right">
        <div className="text-lg font-semibold tabular-nums text-gray-900">
          {row.available_qty}
        </div>

        <div className="text-xs text-gray-400">
          Available
        </div>
      </div>

    </div>
  );
}