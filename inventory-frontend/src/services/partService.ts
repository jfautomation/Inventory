
import { api } from "../api/client";
import { Part } from "../types";

export const PartService = {
  getAll: async (): Promise<Part[]> => {
    const res = await api.get("/inventory/v1/parts");
    return res.data as Part[];
  },
};
