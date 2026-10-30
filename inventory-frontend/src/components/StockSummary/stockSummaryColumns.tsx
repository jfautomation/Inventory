
import type { Column } from "../UI/DataTable/DataTable.types";
import type { StockSummaryRow } from "../../services/StockSummaryService";
import ConditionPill from "../UI/ConditionPill";

type StockSummaryColumnActions = {
  editingId: number | null;
  draftSku: string;
  savingId: number | null;
  onStartEditing: (row: StockSummaryRow) => void;
  onDraftChange: (value: string) => void;
  onSave: (variantId: number) => void;
  onCancel: () => void;
};

export const stockSummaryColumns = ({
  editingId,
  draftSku,
  savingId,
  onStartEditing,
  onDraftChange,
  onSave,
  onCancel,
}: StockSummaryColumnActions): Column<StockSummaryRow>[] => [
  {
    key: "part_name",
    label: "Part Name",
    render: (row) => (
      <span className="font-medium text-gray-900">
        {row.part_name}
      </span>
    ),
  },
  {
    key: "condition_name",
    label: "Condition",
    render: (row) =>
      row.condition_name ? (
        <ConditionPill condition={row.condition_name} />
      ) : (
        "-"
      ),
  },
  {
    key: "available_qty",
    label: "Available Qty",
    align: "right",
    render: (row) => (
      <span className="font-medium tabular-nums text-gray-900">
        {row.available_qty}
      </span>
    ),
  },
  {
    key: "sku",
    label: "SKU",
    render: (row) => {
      const isEditing = editingId === row.id;
      const isSaving = savingId === row.id;

      if (!isEditing) {
        return (
          <span className="font-mono text-gray-700">
            {row.sku || "—"}
          </span>
        );
      }

      return (
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
          className="
            w-32
            rounded-md
            border border-blue-300
            px-3 py-2
            text-sm
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-100
            disabled:opacity-50
          "
          autoFocus
        />
      );
    },
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
    render: (row) => {
      const isEditing = editingId === row.id;
      const isSaving = savingId === row.id;

      if (isEditing) {
        return (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onSave(row.id)}
              disabled={isSaving}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        );
      }

      return (
        <div className="text-right">
          <button
            type="button"
            onClick={() => onStartEditing(row)}
            disabled={editingId !== null}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Edit SKU
          </button>
        </div>
      );
    },
  },
];
