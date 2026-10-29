import { useCallback, useEffect, useState } from "react";
import {
  StockSummaryService,
  StockSummaryRow,
} from "../../services/StockSummaryService";

export default function StockSummaryPage() {
  const [rows, setRows] = useState<StockSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftSku, setDraftSku] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await StockSummaryService.getAll();
      setRows(data);
    } catch (err: unknown) {
      const message = (
        err as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      setError(message || "Unable to load the Stock Summary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const startEditing = (row: StockSummaryRow) => {
    setEditingId(row.id);
    setDraftSku(row.sku);
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftSku("");
    setError("");
  };

  const saveSku = async (variantId: number) => {
    const sku = draftSku.trim();

    if (!/^\d{7}$/.test(sku)) {
      setError("SKU must contain exactly seven digits.");
      return;
    }

    setSavingId(variantId);
    setError("");

    try {
      const updated = await StockSummaryService.updateSku(
        variantId,
        sku
      );

      setRows((currentRows) =>
        currentRows.map((row) =>
          row.id === variantId
            ? { ...row, sku: updated.sku }
            : row
        )
      );

      setEditingId(null);
      setDraftSku("");
    } catch (err: unknown) {
      const message = (
        err as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      setError(message || "Unable to save the SKU.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Stock Summary
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Inventory quantities grouped by part and condition.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRows()}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading && rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading stock summary...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Part Name
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Condition
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Available Qty
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((row) => {
                  const isEditing = editingId === row.id;
                  const isSaving = savingId === row.id;

                  return (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {row.part_name}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {row.condition_name}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-medium tabular-nums text-gray-900">
                        {row.available_qty}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {isEditing ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={7}
                            value={draftSku}
                            onChange={(event) =>
                              setDraftSku(
                                event.target.value.replace(/\D/g, "").slice(0, 7)
                              )
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                void saveSku(row.id);
                              }

                              if (event.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            aria-label={`SKU for ${row.part_name}, ${row.condition_name}`}
                            className="w-32 rounded-md border border-blue-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono">
                            {row.sku || "—"}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => void saveSku(row.id)}
                              disabled={isSaving}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditing(row)}
                            disabled={editingId !== null}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Edit SKU
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-gray-500"
                    >
                      No stock variants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-gray-200 px-5 py-3 text-sm text-gray-500">
          {rows.length} variant{rows.length === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}