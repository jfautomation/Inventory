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
  }) => {

    const res = await api.post(
      `/inventory/v1/parts`,
      data
    );

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