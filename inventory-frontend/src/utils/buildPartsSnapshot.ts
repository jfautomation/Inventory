import { Product } from "../types";

export type PartSnapshot = {
  id: number;
  name: string;
  count: number;
};

export function buildPartsSnapshot(products: Product[]): PartSnapshot[] {
  const map = new Map<number, PartSnapshot>();

  products.forEach((product) => {
    product.part?.forEach((part) => {
      if (!map.has(part.id)) {
        map.set(part.id, {
          id: part.id,
          name: part.name,
          count: 1,
        });
      } else {
        map.get(part.id)!.count += 1;
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}