import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClimateProvider } from "./contexts/ClimateContext";
import { LightingProvider } from "./contexts/LightingContext";
import { RootLayout } from "./layouts/RootLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
