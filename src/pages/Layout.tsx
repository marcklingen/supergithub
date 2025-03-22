
import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader
} from "@/components/ui/sidebar";
import RepoSidebar from '@/components/layout/RepoSidebar';

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Layout effect - Auth state:", { user: !!user, loading });
    if (!loading && !user) {
      console.log("No user detected, redirecting to /auth");
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }

  // If not authenticated and not loading, redirect to auth
  if (!user && !loading) {
    console.log("Rendering Navigate to /auth");
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-hidden">
        <Sidebar>
          <SidebarContent>
            <RepoSidebar />
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
