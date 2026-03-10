import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { UiProvider } from "./context/UiContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UiProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </UiProvider>
  </StrictMode>,
);
