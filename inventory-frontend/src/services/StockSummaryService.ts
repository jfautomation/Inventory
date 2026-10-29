import { api } from "../api/client";

export interface StockSummaryRow {
  id: number;
  part_id: number;
  part_name: string;
  condition_id: number;
  condition_name: string;
  available_qty: number;
  sku: string;
}

export const StockSummaryService = {
  getAll: async (): Promise<StockSummaryRow[]> => {
    const response = await api.get("/inventory/v1/stock-summary");
    return response.data;
  },

  updateSku: async (
    variantId: number,
    sku: string
  ): Promise<{ id: number; sku: string }> => {
    const response = await api.put(
      `/inventory/v1/stock-summary/${variantId}/sku`,
      { sku }
    );

    return response.data;
  },
};