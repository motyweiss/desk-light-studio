import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { LightingProvider } from "@/features/lighting";
import { ClimateProvider } from "@/features/climate";
import { HAConnectionProvider } from "@/contexts/HAConnectionContext";
import { AppLoadProvider } from "./contexts/AppLoadContext";
import { AuthProvider } from "./contexts/AuthContext";
import { RootLayout } from "./layouts/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OfflineIndicator } from "./components/OfflineIndicator";

import Index from "./pages/Index";
import Settings from "./pages/Settings";
import DesignSystem from "./pages/DesignSystem";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <HAConnectionProvider>
              <AppLoadProvider>
                <LightingProvider>
                  <ClimateProvider>
                    <Routes>
                      {/* Auth page outside RootLayout for clean UI */}
                      <Route path="/auth" element={<Auth />} />
                      
                      {/* Demo page - standalone */}
                      <Route path="/demo" element={<ProtectedRoute><Demo /></ProtectedRoute>} />
                      
                      {/* All other pages inside RootLayout */}
                      <Route element={<RootLayout><Outlet /></RootLayout>}>
                        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                        <Route path="/design-system" element={<ProtectedRoute><DesignSystem /></ProtectedRoute>} />
                      </Route>
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <OfflineIndicator />
                  </ClimateProvider>
                </LightingProvider>
              </AppLoadProvider>
            </HAConnectionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;