import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inventory from "./components/Inventory";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import PartDetail from "./components/PartDetail/PartDetail";
import PartsPage from "./components/PartsPage/PartsPage";
import ProductsPage from "./components/ProductsPage/ProductsPage";
import { ModalProvider } from "./context/ModalContext";
import GlobalModals from "./components/GlobalModals/GlobalModals";

function App() {
  return (
    <ModalProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inventory />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/parts" element={<PartsPage />} />
          <Route path="/part/:id" element={<PartDetail />} />
        </Routes>
         <GlobalModals />
      </BrowserRouter>
     
    </ModalProvider>
  );
}

export default App;


