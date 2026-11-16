
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import type { Product, Part, ProductListing } from "../types";

type ModalContextType = {
  // SERIALIZED PRODUCT MODAL
  isProductOpen: boolean;
  editingProduct: Product | null;
  initialListingId: number | null;

  openProduct: () => void;
  openProductForListing: (listingId: number) => void;
  openEditProduct: (product: Product) => void;
  closeProduct: () => void;

  // PART MODAL
  isPartOpen: boolean;
  editingPart: Part | null;

  openPart: () => void;
  openEditPart: (part: Part) => void;
  closePart: () => void;

  // PART VARIATION / PRODUCT LISTING MODAL
  isListingOpen: boolean;
  editingListing: ProductListing | null;

  openListing: () => void;
  openEditListing: (listing: ProductListing) => void;
  closeListing: () => void;

  // REFRESH
  refetchInventory: (() => void) | null;
  setRefetchInventory: (fn: () => void) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  // SERIALIZED PRODUCT STATE
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [initialListingId, setInitialListingId] = useState<number | null>(null);

  // PART STATE
  const [isPartOpen, setIsPartOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  // PART VARIATION / PRODUCT LISTING STATE
  const [isListingOpen, setIsListingOpen] = useState(false);
  const [editingListing, setEditingListing] =
    useState<ProductListing | null>(null);

  // REFRESH STATE
  const [refetchInventory, setRefetchInventoryState] =
    useState<(() => void) | null>(null);

  const setRefetchInventory = useCallback((fn: () => void) => {
    setRefetchInventoryState(() => fn);
  }, []);

  // SERIALIZED PRODUCT ACTIONS
  const openProduct = () => {
    setEditingProduct(null);
    setInitialListingId(null);
    setIsProductOpen(true);
  };

  const openProductForListing = (listingId: number) => {
    setEditingProduct(null);
    setInitialListingId(listingId);
    setIsProductOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setInitialListingId(null);
    setIsProductOpen(true);
  };

  const closeProduct = () => {
    setIsProductOpen(false);
    setEditingProduct(null);
    setInitialListingId(null);
  };

  // PART ACTIONS
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

  // PART VARIATION / PRODUCT LISTING ACTIONS
  const openListing = () => {
    setEditingListing(null);
    setIsListingOpen(true);
  };

  const openEditListing = (listing: ProductListing) => {
    setEditingListing(listing);
    setIsListingOpen(true);
  };

  const closeListing = () => {
    setIsListingOpen(false);
    setEditingListing(null);
  };

  return (
    <ModalContext.Provider
      value={{
        isProductOpen,
        editingProduct,
        initialListingId,
        openProduct,
        openProductForListing,
        openEditProduct,
        closeProduct,

        isPartOpen,
        editingPart,
        openPart,
        openEditPart,
        closePart,

        isListingOpen,
        editingListing,
        openListing,
        openEditListing,
        closeListing,

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
