import { api } from "../api/client";
import { Product, ProductPayload } from "../types";
import { normalizeProduct } from "../utils/normalizeProduct";

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const res = await api.get("/wp/v2/product");

    return res.data.map(normalizeProduct); // 🔥 FIX HERE
  },

  create: async (data: ProductPayload): Promise<Product> => {
    const res = await api.post("/wp/v2/product", data);
    return normalizeProduct(res.data); // 🔥 keep consistent
  },

  update: async (id: number, data: ProductPayload): Promise<Product> => {
    const res = await api.put(`/wp/v2/product/${id}`, data);
    return normalizeProduct(res.data);
  },

  delete: async (id: number) => {
    const res = await api.delete(`/wp/v2/product/${id}`);
    return res.data;
  },
};