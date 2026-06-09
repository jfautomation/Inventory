import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inventory from "./components/Inventory";
import ProductDetail from "./components/ProductDetail/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inventory />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


// import { useState, useEffect } from "react";
// import { Routes, Route } from "react-router-dom";
// import Inventory from "./components/Inventory";
// import ProductDetail from "./components/ProductDetail/ProductDetail";
// import Login from "./components/Login/Login";

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("jwt_token");
//     setIsLoggedIn(!!token);
//     setLoading(false);
//   }, []);

//   if (loading) return null;

//   if (!isLoggedIn) {
//     return <Login onSuccess={() => setIsLoggedIn(true)} />;
//   }

//   return (
//   <Routes>
//     <Route path="/" element={<Inventory />} />
//     <Route path="/product/:id" element={<ProductDetail />} />

//     {/* ADD THIS */}
//     <Route path="*" element={<Inventory />} />
//   </Routes>
// );
// }

// export default App;