
import { useCallback, useEffect, useState } from "react";
import { Package, RefreshCw } from "lucide-react";

import { StockSummaryService } from "../../services/StockSummaryService";
import type { StockSummaryRow } from "../../services/StockSummaryService";

import PageContainer from "../UI/PageContainer";
import PageHeader from "../UI/PageHeader";
import DataTable from "../UI/DataTable/DataTable";

import { stockSummaryColumns } from "./stockSummaryColumns";

export default function StockSummaryPage() {
  const [rows, setRows] = useState<StockSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  // TABLE COLUMNS
  // =========================================================

  const columns = stockSummaryColumns({
    editingId,
    draftSku,
    savingId,
    onStartEditing: startEditing,
    onDraftChange: setDraftSku,
    onSave: (variantId) => {
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
        data={rows}
        getRowKey={(row) => row.id}
        loading={loading && rows.length === 0}
        emptyMessage="No stock variants found."
        tableHeader="Stock Summary Inventory"
        tableHeaderIcon={<Package size={20} />}
        footer={
          loading && rows.length === 0
            ? undefined
            : `${rows.length} variant${rows.length === 1 ? "" : "s"}`
        }
      />
    </PageContainer>
  );
}
