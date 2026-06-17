import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Inventory from "./components/Inventory";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import PartDetail from "./components/PartDetail/PartDetail";
import PartsPage from "./components/PartsPage/PartsPage";
import Login from "./components/Login/Login";
import ProductsPage from "./components/ProductsPage/ProductsPage";
import { ModalProvider } from "./context/ModalContext";
import { InventoryProvider } from "./context/InventoryContext";
import GlobalModals from "./components/GlobalModals/GlobalModals";


// ✅ Wrapper to avoid window.location.reload
const LoginWrapper = () => {
  const navigate = useNavigate();

  return (
    <Login
      onSuccess={() => navigate("/")}
    />
  );
};

function App() {
  return (
    <InventoryProvider>
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginWrapper />} />

            <Route path="/" element={<Inventory />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/parts" element={<PartsPage />} />
            <Route path="/part/:id" element={<PartDetail />} />
          </Routes>

          <GlobalModals />
        </BrowserRouter>
      </ModalProvider>
    </InventoryProvider>
  );
}

export default App;
