import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");

console.log("🔥 React entry file is executing");
console.log("ROOT ELEMENT:", document.getElementById("root"));
console.log("ALL ROOTS:", document.querySelectorAll("#root"));

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}