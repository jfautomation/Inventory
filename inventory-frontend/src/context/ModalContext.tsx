import React, { createContext, useContext, useState } from "react";
import { Product, Part } from "../types";

type ModalContextType = {
  // =========================
  // PRODUCT MODAL
  // =========================
  isProductOpen: boolean;
  editingProduct: Product | null;

  openProduct: () => void;
  openEditProduct: (product: Product) => void;
  closeProduct: () => void;

  // =========================
  // PART MODAL (NEW)
  // =========================
  isPartOpen: boolean;
  editingPart: Part | null;

  openPart: () => void;
  openEditPart: (part: Part) => void;
  closePart: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  // =========================
  // PRODUCT STATE
  // =========================
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // =========================
  // PART STATE
  // =========================
  const [isPartOpen, setIsPartOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // =========================
  // PRODUCT ACTIONS
  // =========================
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

  // =========================
  // PART ACTIONS
  // =========================
  const openPart = () => {
    setEditingPart(null);
    setIsPartOpen(true);
  };

  const openEditPart = (part: Part) => {
    setEditingPart(part);
    setIsPartOpen(true);
  };

  const closePart = () => {
    setIsPartOpen(false);
    setEditingPart(null);
  };

  return (
    <ModalContext.Provider
      value={{
        // product
        isProductOpen,
        editingProduct,
        openProduct,
        openEditProduct,
        closeProduct,

        // part
        isPartOpen,
        editingPart,
        openPart,
        openEditPart,
        closePart,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);

  if (!ctx) {
    throw new Error("useModal must be used inside ModalProvider");
  }

  return ctx;
};