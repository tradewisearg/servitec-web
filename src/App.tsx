import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Celulares from "./pages/Celulares";
import Computadoras from "./pages/Computadoras";
import Consolas from "./pages/Consolas";
import Tienda from "./pages/Tienda";
import Condiciones from "./pages/Condiciones";
import Presupuesto from "./pages/Presupuesto";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/celulares" element={<Celulares />} />
          <Route path="/computadoras" element={<Computadoras />} />
          <Route path="/consolas" element={<Consolas />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/condiciones" element={<Condiciones />} />
          <Route path="/presupuesto" element={<Presupuesto />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
