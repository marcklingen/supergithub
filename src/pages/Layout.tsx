
import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import RepoSidebar from '@/components/layout/RepoSidebar';
import { useAuth } from '@/contexts/AuthContext';

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
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
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <RepoSidebar />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
