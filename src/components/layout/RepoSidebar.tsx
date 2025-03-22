
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRepo, DiscussionCategory } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRepositoryDiscussionCategories } from '@/lib/github';
import { 
  FolderKanban,
  MessageSquare,
  BookOpen,
  Tag,
  PlusCircle,
  ChevronRight, 
  Github,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const RepoSidebar = () => {
  const { activeRepository, repositories, setActiveRepository, categories, setActiveCategory, activeCategory } = useRepo();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const token = user?.user_metadata?.provider_token;
  
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useRepositoryDiscussionCategories(
    activeRepository?.owner || '', 
    activeRepository?.name || '', 
    token
  );
  
  useEffect(() => {
    if (data?.repository?.discussionCategories?.nodes) {
      // This would ideally be handled in RepoContext by providing a setCategories function
      // But for simplicity, we'll manually update it here
      const categories = data.repository.discussionCategories.nodes.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        description: cat.description
      }));
      // @ts-ignore - context doesn't expose setCategories but we know it exists
      setActiveCategory(categories.length > 0 ? categories[0] : null);
    }
  }, [data, setActiveCategory]);
  
  const handleRepoChange = (repo: any) => {
    setActiveRepository(repo);
    setActiveCategory(null);
  };
  
  const handleCategoryClick = (category: DiscussionCategory) => {
    setActiveCategory(category);
    navigate('/discussions');
  };
  
  if (!user) {
    return <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <h3 className="text-lg font-semibold">SuperGitHub</h3>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4">
          <p>Please sign in to continue</p>
          <Button 
            className="w-full mt-4" 
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>;
  }
  
  if (repositories.length === 0) {
    return <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <h3 className="text-lg font-semibold">SuperGitHub</h3>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-4">
          <p>No repositories connected</p>
          <Button 
            className="w-full mt-4" 
            onClick={() => navigate('/repositories')}
          >
            Connect Repository
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>;
  }
  
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4 border-b flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold hover:text-primary transition-colors">
          SuperGitHub
        </Link>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4 flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Github size={16} />
                    <span className="truncate">
                      {activeRepository?.fullName || 'Select Repository'}
                    </span>
                  </div>
                  <ChevronRight size={16} />
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
                    <PlusCircle size={16} />
                    <span>Add Repository</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">Discussion Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="p-4">
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm flex gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p>Failed to load categories</p>
                    <p className="text-xs mt-1 text-destructive/80">
                      {(error as Error)?.message || 'Check if discussions are enabled for this repository'}
                    </p>
                  </div>
                </div>
              </div>
            ) : data?.repository?.discussionCategories?.nodes?.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No discussion categories found. Check if discussions are enabled for this repository.
              </div>
            ) : (
              <SidebarMenu>
                {data?.repository?.discussionCategories?.nodes?.map((category: any) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton 
                      onClick={() => handleCategoryClick({
                        id: category.id,
                        name: category.name,
                        emoji: category.emoji,
                        description: category.description
                      })}
                      className={
                        activeCategory?.id === category.id ? 
                        'bg-accent text-accent-foreground' : ''
                      }
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-base" role="img" aria-label={category.name}>
                          {category.emoji}
                        </span>
                        <span>{category.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-4">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <BookOpen size={16} />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/discussions" className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span>Discussions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/repositories" className="flex items-center gap-2">
                    <FolderKanban size={16} />
                    <span>Repositories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default RepoSidebar;
