
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import RepositoryDropdown from './RepositoryDropdown';
import DiscussionCategories from './DiscussionCategories';
import UserProfile from './UserProfile';
import ThemeSwitcher from './ThemeSwitcher';

const RepoSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">SuperGitHub</h3>
          <ThemeSwitcher />
        </div>
        <div className="p-4 flex-1">
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
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold hover:text-primary transition-colors">
          SuperGitHub
        </Link>
        <ThemeSwitcher />
      </div>
      
      <div className="flex-1 overflow-auto">
        <RepositoryDropdown />
        <DiscussionCategories />
      </div>
      
      <div className="mt-auto border-t">
        <UserProfile />
      </div>
    </div>
  );
};

export default RepoSidebar;
