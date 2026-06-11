import React, { createContext, useContext, useState } from "react";

type ModalContextType = {
  isProductOpen: boolean;
  openProduct: () => void;
  closeProduct: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isProductOpen, setIsProductOpen] = useState(false);

  const openProduct = () => setIsProductOpen(true);
  const closeProduct = () => setIsProductOpen(false);

  return (
    <ModalContext.Provider
      value={{
        isProductOpen,
        openProduct,
        closeProduct,
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