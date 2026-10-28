import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout from "./components/Layout/AppLayout/AppLayout";
import Inventory from "./components/Inventory";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import PartDetail from "./components/PartDetail/PartDetail";
import PartsPage from "./components/PartsPage/PartsPage";
import Login from "./components/Login/Login";
import ProductsPage from "./components/ProductsPage/ProductsPage";

import { ModalProvider } from "./context/ModalContext";
import { InventoryProvider } from "./context/InventoryContext";
import GlobalModals from "./components/GlobalModals/GlobalModals";

function LoginWrapper() {
  const navigate = useNavigate();

  return <Login onSuccess={() => navigate("/")} />;
}

// Redirect old singular URLs to the new plural URLs.
function LegacyProductRedirect() {
  const { id } = useParams();

  return <Navigate to={`/products/${id}`} replace />;
}

function LegacyPartRedirect() {
  const { id } = useParams();

  return <Navigate to={`/parts/${id}`} replace />;
}

function App() {
  return (
    <InventoryProvider>
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            {/* Login does not use the application layout */}
            <Route path="/login" element={<LoginWrapper />} />

            {/* Main application layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Inventory />} />

              {/* Products */}
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/:slug" element={<ProductDetail />} />

              {/* Parts */}
              <Route path="/parts" element={<PartsPage />} />
              <Route path="/parts/:id" element={<PartDetail />} />
              <Route path="/parts/:id/:slug" element={<PartDetail />} />

              {/* Backward compatibility for existing links */}
              <Route
                path="/product/:id"
                element={<LegacyProductRedirect />}
              />
              <Route
                path="/part/:id"
                element={<LegacyPartRedirect />}
              />
            </Route>
          </Routes>

          <GlobalModals />
        </BrowserRouter>
      </ModalProvider>
    </InventoryProvider>
  );
}

export default App;