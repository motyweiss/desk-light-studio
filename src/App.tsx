import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClimateProvider } from "@/features/climate";
import { LightingProvider } from "@/features/lighting";
import { AppLoadProvider } from "./contexts/AppLoadContext";
import { RootLayout } from "./layouts/RootLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLoadProvider>
          <ClimateProvider>
            <LightingProvider>
              <BrowserRouter>
                <RootLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </RootLayout>
              </BrowserRouter>
            </LightingProvider>
          </ClimateProvider>
        </AppLoadProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
