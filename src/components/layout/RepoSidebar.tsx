
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import RepositoryDropdown from './RepositoryDropdown';
import DiscussionCategories from './DiscussionCategories';
import UserProfile from './UserProfile';

const RepoSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    return (
      <div className="w-64 h-screen border-r bg-sidebar">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">SuperGitHub</h3>
        </div>
        <div className="p-4">
          <p>Please sign in to continue</p>
          <Button 
            className="w-full mt-4" 
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-64 h-screen border-r bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-4 border-b">
        <Link to="/" className="text-lg font-semibold hover:text-primary transition-colors">
          SuperGitHub
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto">
        <RepositoryDropdown />
        <DiscussionCategories />
        {/* NavigationLinks component removed from here */}
      </div>
      
      <UserProfile />
    </div>
  );
};

export default RepoSidebar;
