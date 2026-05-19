
import { useState, useEffect } from "react";
import Inventory from "./components/Inventory";
import Login from "./components/Login/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!isLoggedIn) {
    return (
      <Login
        onSuccess={() => {
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return <Inventory />;
}

export default App;