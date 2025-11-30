import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClimateProvider } from "./contexts/ClimateContext";
import { RootLayout } from "./layouts/RootLayout";
import Index from "./pages/Index";
import LivingRoom from "./pages/LivingRoom";
import Bedroom from "./pages/Bedroom";
import Kitchen from "./pages/Kitchen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClimateProvider>
        <BrowserRouter>
          <RootLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/living" element={<LivingRoom />} />
              <Route path="/bedroom" element={<Bedroom />} />
              <Route path="/kitchen" element={<Kitchen />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RootLayout>
        </BrowserRouter>
      </ClimateProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
