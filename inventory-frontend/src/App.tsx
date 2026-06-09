import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inventory from "./components/Inventory";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import PartDetail from "./components/PartDetail/PartDetail";
import PartsPage from "./components/PartsPage/PartsPage";
import ProductsPage from "./components/ProductsPage/ProductsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inventory />} />
         <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/parts" element={<PartsPage />} />
        <Route path="/part/:id" element={<PartDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


