
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import RepoSidebar from '@/components/layout/RepoSidebar';

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <RepoSidebar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
