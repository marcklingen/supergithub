
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RepoProvider } from "@/contexts/RepoContext";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Repositories from "./pages/Repositories";
import Discussions from "./pages/Discussions";
import AccountSettings from "./pages/AccountSettings";
import Layout from "./pages/Layout";

// Configure the React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
              
              {/* Routes with sidebar layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/repositories" replace />} />
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/discussions" element={<Discussions />} />
                <Route path="/discussions/:discussionNumber" element={<Discussions />} />
                <Route path="/account-settings" element={<AccountSettings />} />
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
