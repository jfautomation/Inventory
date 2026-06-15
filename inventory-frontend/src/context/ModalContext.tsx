import React, { createContext, useContext, useState } from "react";
import { Product } from "../types";

type ModalContextType = {
  isProductOpen: boolean;
  editingProduct: Product | null;

  openProduct: () => void;
  openEditProduct: (product: Product) => void;
  closeProduct: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openProduct = () => {
    setEditingProduct(null);
    setIsProductOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductOpen(true);
  };

  const closeProduct = () => {
    setIsProductOpen(false);
    setEditingProduct(null);
  };

  const value: ModalContextType = {
    isProductOpen,
    editingProduct,
    openProduct,
    openEditProduct,
    closeProduct,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);

  if (ctx === undefined) {
    throw new Error("useModal must be used inside ModalProvider");
  }

  return ctx;
};