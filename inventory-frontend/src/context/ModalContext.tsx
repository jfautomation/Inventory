import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { Product, Part } from "../types";

type ModalContextType = {
  isProductOpen: boolean;
  editingProduct: Product | null;

  openProduct: () => void;
  openEditProduct: (product: Product) => void;
  closeProduct: () => void;

  isPartOpen: boolean;
  editingPart: Part | null;

  openPart: () => void;
  openEditPart: (part: Part) => void;
  closePart: () => void;

  refetchInventory: (() => void) | null;
  setRefetchInventory: (fn: () => void) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  // =========================
  // MODAL STATE
  // =========================
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isPartOpen, setIsPartOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // =========================
  // REFETCH (FIXED)
  // =========================
  const [refetchInventory, setRefetchInventoryState] =
    useState<(() => void) | null>(null);

  const setRefetchInventory = useCallback((fn: () => void) => {
    setRefetchInventoryState(fn);
  }, []);

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
        isProductOpen,
        editingProduct,
        openProduct,
        openEditProduct,
        closeProduct,

        isPartOpen,
        editingPart,
        openPart,
        openEditPart,
        closePart,

        refetchInventory,
        setRefetchInventory,
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