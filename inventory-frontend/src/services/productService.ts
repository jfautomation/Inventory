import { api } from "../api/client";
import { Product, ProductPayload } from "../types";

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const res = await api.get("/wp/v2/product");
    return res.data;
  },

  // ✅ use ProductPayload (API shape)
  create: async (data: ProductPayload): Promise<Product> => {
    const res = await api.post("/wp/v2/product", data);
    return res.data;
  },

  update: async (id: number, data: ProductPayload): Promise<Product> => {
    const res = await api.put(`/wp/v2/product/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    const res = await api.delete(`/wp/v2/product/${id}`);
    return res.data;
  },
};