import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { api } from "../api/client";

type InventoryContextType = {
  products: any[];
  parts: any[];

  fetchProducts: () => Promise<void>;
  fetchParts: () => Promise<void>;
  refreshInventory: () => Promise<void>;
};

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export const InventoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/wp/v2/product");
      setProducts(res.data || []);
    } catch (err) {
      console.error("fetchProducts failed:", err);
    }
  }, []);

  const fetchParts = useCallback(async () => {
    try {
      const res = await api.get("/inventory/v1/parts");
      setParts(res.data || []);
    } catch (err) {
      console.error("fetchParts failed:", err);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchParts()]);
  }, [fetchProducts, fetchParts]);

  return (
    <InventoryContext.Provider
      value={{
        products,
        parts,
        fetchProducts,
        fetchParts,
        refreshInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const ctx = useContext(InventoryContext);

  if (!ctx) {
    throw new Error("useInventory must be used inside InventoryProvider");
  }

  return ctx;
};