
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const RepositoryDropdown: React.FC = () => {
  const { activeRepository, repositories, setActiveRepository, setActiveCategory } = useRepo();
  const navigate = useNavigate();
  
  const handleRepoChange = (repo: any) => {
    setActiveRepository(repo);
    setActiveCategory(null);
  };
  
  return (
    <div className="p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2 truncate">
              <FolderKanban size={16} />
              <span className="truncate">
                {activeRepository?.fullName || 'Select Repository'}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Your Repositories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {repositories.map((repo) => (
              <DropdownMenuItem 
                key={repo.fullName}
                onClick={() => handleRepoChange(repo)}
                className={activeRepository?.fullName === repo.fullName ? 'bg-accent' : ''}
              >
                <div className="flex items-center gap-2 w-full truncate">
                  <FolderKanban size={16} />
                  <span className="truncate">{repo.fullName}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/repositories')}>
            <div className="flex items-center gap-2 w-full">
              <FolderKanban size={16} />
              <span>Manage Repositories</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RepositoryDropdown;
