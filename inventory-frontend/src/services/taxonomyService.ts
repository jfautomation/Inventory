import { api } from "../api/client";

export const TaxonomyService = {

  //////////////////////////////////////////////////
  // PARTS
  //////////////////////////////////////////////////

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
    series_id?: number;
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

//   getSeriesByBrand: async (brandId: number) => {
//     const res = await api.get(`/inventory/v1/series`, {
//       params: { brand_id: brandId },
//     });

//     return res.data;
//   },
// };

getSeriesByBrand: async (brandId: number) => {
    console.log("=== API CALL: GET SERIES ===");
    console.log("brandId:", brandId);

    const res = await api.get(`/inventory/v1/series`, {
        params: { brand_id: brandId },
    });

    console.log("=== SERIES API RESPONSE ===");
    console.log("status:", res.status);
    console.log("data:", res.data);
    console.log("isArray:", Array.isArray(res.data));

    return res.data;
},
}