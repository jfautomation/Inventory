import { api } from "../api/client";

export const TaxonomyService = {
  // ✅ custom filtered list (correct)
  getPartsByBrand: async (brandId: number) => {
    const res = await api.get(`/inventory/v1/parts`, {
      params: { brand_id: brandId },
    });
    return res.data;
  },

  // ✅ IMPORTANT: also use custom endpoint later
  getPart: async (id: number) => {
    const res = await api.get(`/inventory/v1/parts`, {
      params: { id },
    });

    // fallback filter (until backend supports single endpoint)
    return res.data?.find((p: any) => p.id === id);
  },

  // ❌ DO NOT USE wp/v2 yet (breaks consistency)
  // replace with custom endpoint later
  createPart: async (data: {
    name: string;
    brand_id: number;
    category_id?: number;
  }) => {
    const res = await api.post(`/inventory/v1/parts/create`, data);
    return res.data;
  },
};