import { createContext, useContext, useState, useCallback } from "react";

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [splashVisible, setSplashVisible] = useState(false);
  const [splashMessage, setSplashMessage] = useState("");

  const showSplash = useCallback((message = "") => {
    setSplashMessage(message);
    setSplashVisible(true);
  }, []);

  const hideSplash = useCallback(() => {
    setSplashVisible(false);
    setSplashMessage("");
  }, []);

  const value = {
    splashVisible,
    splashMessage,
    showSplash,
    hideSplash,
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) {
    throw new Error("useUi deve ser usado dentro de UiProvider");
  }
  return ctx;
}

