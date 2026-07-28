import { api } from "../api/client";
import { Term } from "../types";

export const PartService = {
  getAll: async (): Promise<Term[]> => {
    console.log("PartService.getAll() called");

    const res = await api.get("/wp/v2/part");

    console.log("PART API RESPONSE:", res.data);

    return res.data;
  },
};