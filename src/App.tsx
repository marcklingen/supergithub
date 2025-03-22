
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { RepoProvider } from './contexts/RepoContext';

import Layout from './pages/Layout';
import Auth from './pages/Auth';
import Repositories from './pages/Repositories';
import Discussions from './pages/Discussions';
import AccountSettings from './pages/AccountSettings';
import NotFound from './pages/NotFound';
import GitHubToken from './pages/GitHubToken';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RepoProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Navigate to="/repositories" replace />} />
              
              <Route element={<Layout />}>
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/discussions" element={<Discussions />} />
                <Route path="/discussions/:discussionNumber" element={<Discussions />} />
                <Route path="/account" element={<AccountSettings />} />
                <Route path="/github-token" element={<GitHubToken />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </RepoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
