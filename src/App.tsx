import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { LightingProvider } from "@/features/lighting";
import { AppLoadProvider } from "./contexts/AppLoadContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RootLayout } from "./layouts/RootLayout";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import DesignSystem from "./pages/DesignSystem";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient(); // Force rebuild

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppLoadProvider>
              <LightingProvider>
                <RootLayout>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="/design-system" element={<ProtectedRoute><DesignSystem /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </RootLayout>
                <UpdatePrompt />
                <OfflineIndicator />
              </LightingProvider>
            </AppLoadProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
