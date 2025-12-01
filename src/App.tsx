import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClimateProvider } from "./contexts/ClimateContext";
import { LightingProvider } from "./contexts/LightingContext";
import { AppLoadProvider } from "./contexts/AppLoadContext";
import { DeviceDiscoveryProvider } from "./contexts/DeviceDiscoveryContext";
import { RootLayout } from "./layouts/RootLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import SidePage from "./pages/SidePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppLoadProvider>
        <ClimateProvider>
          <LightingProvider>
            <DeviceDiscoveryProvider>
              <BrowserRouter>
                <RootLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/side-page" element={<SidePage />} />
                    <Route path="/settings" element={<Settings />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </RootLayout>
              </BrowserRouter>
            </DeviceDiscoveryProvider>
          </LightingProvider>
        </ClimateProvider>
      </AppLoadProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
