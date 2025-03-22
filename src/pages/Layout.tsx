
import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import RepoSidebar from '@/components/layout/RepoSidebar';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="min-h-screen flex w-full">
      <RepoSidebar />
      <div className="flex-1 overflow-auto pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
