import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/serviceWorker";

// Register service worker for offline support and caching
registerServiceWorker({
  onSuccess: () => {
    console.log('✅ Service Worker active - Offline support enabled');
  },
  onUpdate: () => {
    console.log('🔄 New version available - Reload to update');
  },
  onError: (error) => {
    console.error('❌ Service Worker registration failed:', error);
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);