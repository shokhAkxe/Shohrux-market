import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./styles/index.css";
import "./i18n";

// Yangi Google Client ID (Siz yuborgan oxirgi kalit)
const GOOGLE_CLIENT_ID = "716548326454-c89cujvc85cm4ls754nfjheictmrptch.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);