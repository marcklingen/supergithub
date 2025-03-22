
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRepo, DiscussionCategory } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRepositoryDiscussionCategories } from '@/lib/github';
import { 
  FolderKanban,
  MessageSquare,
  BookOpen,
  ChevronRight, 
  Github,
  Loader2,
  AlertTriangle,
  User,
  LogOut,
  Settings
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
  SidebarFooter
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
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const RepoSidebar = () => {
  const { activeRepository, repositories, setActiveRepository, setActiveCategory, activeCategory } = useRepo();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = user?.user_metadata?.provider_token;
  const avatarUrl = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || 'User';
  
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
      console.log('Discussion categories loaded:', data.repository.discussionCategories.nodes);
      const categories = data.repository.discussionCategories.nodes.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        description: cat.description
      }));
      
      if (categories.length > 0) {
        setActiveCategory(categories[0]);
      } else {
        setActiveCategory(null);
      }
    } else if (data?.repository && data.repository.hasDiscussionsEnabled === false) {
      console.warn('Repository has discussions disabled');
      toast({
        title: "Discussions Disabled",
        description: "This repository doesn't have discussions enabled.",
        variant: "destructive"
      });
      setActiveCategory(null);
    }
  }, [data, setActiveCategory, toast]);
  
  const handleRepoChange = (repo: any) => {
    setActiveRepository(repo);
    setActiveCategory(null);
  };
  
  const handleCategoryClick = (category: DiscussionCategory) => {
    setActiveCategory(category);
    navigate('/discussions');
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
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
                    <FolderKanban size={16} />
                    <span>Manage Repositories</span>
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
            ) : data?.repository?.hasDiscussionsEnabled === false ? (
              <div className="p-4 text-sm text-muted-foreground">
                Discussions are not enabled for this repository.
              </div>
            ) : data?.repository?.discussionCategories?.nodes?.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No discussion categories found. Check if discussions are properly configured.
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
                  <Link to="/repositories" className="flex items-center gap-2">
                    <FolderKanban size={16} />
                    <span>Repositories</span>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* User avatar menu in footer */}
      <SidebarFooter className="p-4 border-t mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-start gap-2 h-auto py-2">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={avatarUrl} alt={userName} />
                <AvatarFallback>
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium truncate max-w-[150px]">{userName}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/account-settings')}>
              <User className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default RepoSidebar;
