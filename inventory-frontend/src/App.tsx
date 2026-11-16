
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
import ProtectedRoute from "./components/Auth/ProtectedRoute";

import { ModalProvider } from "./context/ModalContext";
import { InventoryProvider } from "./context/InventoryContext";
import GlobalModals from "./components/GlobalModals/GlobalModals";

function LoginWrapper() {
  const navigate = useNavigate();

  return <Login onSuccess={() => navigate("/", { replace: true })} />;
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
            {/* Login remains outside the application layout */}
            <Route path="/login" element={<LoginWrapper />} />

            {/* All application routes require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Inventory />} />

                {/* Products */}
                <Route path="/products" element={<ProductsPage />} />

                {/* Product Listing Detail */}
                <Route
                  path="/product-listings/:id/:slug"
                  element={<ProductDetail />}
                />
                <Route
                  path="/product-listings/:id"
                  element={<ProductDetail />}
                />

                {/* Parts */}
                <Route path="/parts" element={<PartsPage />} />
                <Route path="/parts/:id" element={<PartDetail />} />
                <Route path="/parts/:id/:slug" element={<PartDetail />} />

                {/* Backward compatibility */}
                <Route
                  path="/product/:id"
                  element={<LegacyProductRedirect />}
                />
                <Route
                  path="/part/:id"
                  element={<LegacyPartRedirect />}
                />
              </Route>
            </Route>
          </Routes>

          <GlobalModals />
        </BrowserRouter>
      </ModalProvider>
    </InventoryProvider>
  );
}

export default App;
