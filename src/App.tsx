
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RepoProvider } from "@/contexts/RepoContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Repositories from "./pages/Repositories";
import Discussions from "./pages/Discussions";
import AccountSettings from "./pages/AccountSettings";
import Layout from "./pages/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RepoProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/repositories" element={<Repositories />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              
              {/* Routes with sidebar layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="/discussions" element={<Discussions />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RepoProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
