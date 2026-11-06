
import { useCallback, useEffect, useState } from "react";
import { Package, RefreshCw, Search, X } from "lucide-react";

import { StockSummaryService } from "../../services/StockSummaryService";
import type { StockSummaryRow } from "../../services/StockSummaryService";

import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import DataTable from "../UI/DataTable/DataTable";

import { stockSummaryColumns } from "./stockSummaryColumns";
import StockSummaryPreviewCard from "./StockSummaryPreviewCard";

export default function StockSummaryPage() {
  const [rows, setRows] = useState<StockSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftSku, setDraftSku] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  // =========================================================
  // LOAD STOCK SUMMARY
  // =========================================================

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

  // =========================================================
  // SKU EDITING
  // =========================================================

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
    if (savingId !== null) return;

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

  // =========================================================
  // SEARCH FILTER
  // =========================================================

  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      row.part_name?.toLowerCase().includes(query) ||
      row.condition_name?.toLowerCase().includes(query) ||
      row.sku?.toLowerCase().includes(query) ||
      String(row.available_qty).includes(query)
    );
  });

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = stockSummaryColumns({
    editingId,
    draftSku,
    savingId,
    onStartEditing: startEditing,
    onDraftChange: setDraftSku,
    onSave: (variantId: number) => {
  void saveSku(variantId);
},
    onCancel: cancelEditing,
  });

  // =========================================================
  // UI
  // =========================================================

  return (
    <PageContainer>
      <PageHeader
        title="Stock Summary"
        actions={
          <button
            type="button"
            onClick={() => void loadRows()}
            disabled={loading || savingId !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      <p className="px-5 py-3 text-sm text-gray-500">
        Inventory quantities grouped by part and condition.
      </p>

      {error && (
        <div
          role="alert"
          className="mx-5 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={filteredRows}
        getRowKey={(row) => row.id}
        loading={loading && rows.length === 0}
        emptyMessage={
          search
            ? "No matching stock variants found."
            : "No stock variants found."
        }
        tableHeader="Stock Summary Inventory"
        tableHeaderIcon={<Package size={20} />}
        toolbar={
          <div className="flex items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search part name, condition, SKU..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  title="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        }
        footer={
          loading && rows.length === 0
            ? undefined
            : `${filteredRows.length} variant${filteredRows.length === 1 ? "" : "s"}`
        }
        renderMobileCard={(row) => (
          <StockSummaryPreviewCard
            row={row}
            editingId={editingId}
            draftSku={draftSku}
            savingId={savingId}
            onStartEditing={startEditing}
            onDraftChange={setDraftSku}
            onSave={(variantId) => {
              void saveSku(variantId);
            }}
            onCancel={cancelEditing}
          />
        )}
      />
    </PageContainer>
  );
}
