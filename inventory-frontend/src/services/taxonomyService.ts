import { api } from "../api/client";

export const TaxonomyService = {

  //////////////////////////////////////////////////
  // PARTS
  //////////////////////////////////////////////////

  getPartsByBrand: async (brandId: number) => {
    const res = await api.get(`/inventory/v1/parts`, {
      params: { brand_id: brandId },
    });

    return res.data;
  },

  getPart: async (id: number) => {
    const res = await api.get(`/inventory/v1/parts`, {
      params: { id },
    });

    return res.data?.find((p: any) => p.id === id);
  },

  createPart: async (data: {
    name: string;
    brand_id: number;
    category_id?: number;
    image_id?: number;
  }) => {
    const res = await api.post(`/inventory/v1/parts`, data);
    return res.data;
  },

  // 🔥 ADD THIS (EDIT PART)
  updatePart: async (
    id: number,
    data: {
      name: string;
      brand_id: number;
      category_id?: number;
      image_id?: number;
    }
  ) => {
    const res = await api.put(`/inventory/v1/parts/${id}`, data);
    return res.data;
  },

  // 🔥 OPTIONAL BUT IMPORTANT (DELETE PART)
  deletePart: async (id: number) => {
    const res = await api.delete(`/inventory/v1/parts/${id}`);
    return res.data;
  },

  //////////////////////////////////////////////////
  // SERIES
  //////////////////////////////////////////////////

  getSeriesByBrand: async (brandId: number) => {
    const res = await api.get(`/inventory/v1/series`, {
      params: { brand_id: brandId },
    });

    return res.data;
  },
};