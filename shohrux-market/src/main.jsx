import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import "./i18n";

// StrictMode ni vaqtincha o'chiramiz (input muammosini tekshirish uchun)
ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);