
import React from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, MessageSquare } from 'lucide-react';

const NavigationLinks: React.FC = () => {
  return (
    <div className="px-4 pt-6">
      <h4 className="text-xs font-medium text-sidebar-foreground/70 px-2 h-8 flex items-center">
        Navigation
      </h4>
      <ul className="space-y-1 mt-1">
        <li>
          <Link 
            to="/repositories" 
            className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <FolderKanban size={16} />
            <span>Repositories</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/discussions" 
            className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <MessageSquare size={16} />
            <span>Discussions</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default NavigationLinks;
