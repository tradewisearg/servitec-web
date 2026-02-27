import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Index = lazy(() => import("./pages/Index"));
const Celulares = lazy(() => import("./pages/Celulares"));
const Computadoras = lazy(() => import("./pages/Computadoras"));
const Consolas = lazy(() => import("./pages/Consolas"));
const Tienda = lazy(() => import("./pages/Tienda"));
const Condiciones = lazy(() => import("./pages/Condiciones"));
const Presupuesto = lazy(() => import("./pages/Presupuesto"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Stock = lazy(() => import("./pages/Stock"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense
          fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Cargando...</div>}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/celulares" element={<Celulares />} />
            <Route path="/computadoras" element={<Computadoras />} />
            <Route path="/consolas" element={<Consolas />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/condiciones" element={<Condiciones />} />
            <Route path="/presupuesto" element={<Presupuesto />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
