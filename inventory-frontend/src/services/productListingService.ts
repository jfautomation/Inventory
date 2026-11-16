
import { api } from "../api/client";
import type { ProductListing, ProductListingPayload } from "../types";

export const ProductListingService = {
  getAll: async (): Promise<ProductListing[]> => {
    const res = await api.get("/inventory/v1/product-listings");
    return res.data as ProductListing[];
  },

  create: async (data: ProductListingPayload): Promise<ProductListing> => {
    const res = await api.post("/inventory/v1/product-listings", data);
    return res.data as ProductListing;
  },

  update: async (
    id: number,
    data: ProductListingPayload
  ): Promise<ProductListing> => {
    const res = await api.put(
      `/inventory/v1/product-listings/${id}`,
      data
    );

    return res.data as ProductListing;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory/v1/product-listings/${id}`);
  },
};
