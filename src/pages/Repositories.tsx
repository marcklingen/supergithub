
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRepositories } from '@/lib/github';
import Navbar from '@/components/layout/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  Loader2, 
  GitBranch, 
  Star, 
  Plus, 
  Trash2, 
  Check, 
  Github,
  MessageSquare 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Repositories = () => {
  const [repoInput, setRepoInput] = useState('');
  const { repositories, addRepository, removeRepository, setActiveRepository } = useRepo();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const token = user?.user_metadata?.provider_token;
  
  const { 
    data: githubRepos, 
    isLoading: isLoadingRepos, 
    isError: isReposError 
  } = useUserRepositories(token);

  const handleAddRepository = () => {
    if (!repoInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a repository name in the format 'owner/repo'",
        variant: "destructive"
      });
      return;
    }
    
    try {
      addRepository(repoInput.trim());
      setRepoInput('');
      toast({
        title: "Repository Added",
        description: `Successfully added ${repoInput.trim()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add repository",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveRepository = (fullName: string) => {
    removeRepository(fullName);
    toast({
      title: "Repository Removed",
      description: `Successfully removed ${fullName}`,
    });
  };
  
  const handleSetActive = (repo: any) => {
    setActiveRepository(repo);
    navigate('/discussions');
  };
  
  const handleConnectGitHubRepo = (repo: any) => {
    try {
      addRepository(`${repo.owner.login}/${repo.name}`);
      toast({
        title: "Repository Added",
        description: `Successfully added ${repo.nameWithOwner}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add repository",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">Repository Management</h1>
        <p className="text-muted-foreground mb-8">
          Connect GitHub repositories to manage their discussions
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add Repository Manually</CardTitle>
                <CardDescription>
                  Enter the full name of the repository in the format 'owner/repo'
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="owner/repo"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                  />
                  <Button onClick={handleAddRepository}>Add</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Connected Repositories</CardTitle>
                <CardDescription>
                  Repositories you've connected for discussion management
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {repositories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No repositories connected yet</p>
                    <p className="text-sm mt-2">Add a repository to get started</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {repositories.map((repo) => (
                      <li key={repo.fullName} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{repo.fullName}</h3>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSetActive(repo)}
                            >
                              <Check size={14} className="mr-1" />
                              Use
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveRepository(repo.fullName)}
                            >
                              <Trash2 size={14} />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your GitHub Repositories</CardTitle>
                <CardDescription>
                  Select from your GitHub repositories with discussions enabled
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingRepos ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : isReposError ? (
                  <div className="bg-destructive/10 text-destructive rounded-md p-4 my-4">
                    <div className="flex gap-2 items-start">
                      <AlertCircle className="h-5 w-5 mt-0.5" />
                      <div>
                        <p>Failed to load your GitHub repositories</p>
                        <p className="text-sm mt-1">
                          Please check your GitHub token permissions or connection
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {githubRepos?.viewer?.repositories?.nodes
                      ?.filter((repo: any) => repo.hasDiscussionsEnabled)
                      ?.map((repo: any) => {
                        const isConnected = repositories.some(r => 
                          r.fullName === repo.nameWithOwner
                        );
                        
                        return (
                          <div key={repo.nameWithOwner} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={repo.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-medium hover:text-primary transition-colors"
                                  >
                                    {repo.nameWithOwner}
                                  </a>
                                  
                                  {repo.hasDiscussionsEnabled && (
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs">
                                      Discussions
                                    </span>
                                  )}
                                </div>
                                
                                {repo.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {repo.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Star size={14} />
                                    <span>{repo.stargazerCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <GitBranch size={14} />
                                    <span>{repo.forkCount}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant={isConnected ? "outline" : "default"} 
                                onClick={() => handleConnectGitHubRepo(repo)}
                                disabled={isConnected}
                              >
                                {isConnected ? (
                                  <>
                                    <Check size={14} className="mr-1" />
                                    <span>Connected</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={14} className="mr-1" />
                                    <span>Connect</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                    {githubRepos?.viewer?.repositories?.nodes?.filter((repo: any) => 
                      repo.hasDiscussionsEnabled
                    ).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No repositories with discussions enabled found</p>
                        <p className="text-sm mt-2">
                          Enable discussions for your repositories on GitHub first
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          asChild
                        >
                          <a 
                            href="https://docs.github.com/en/discussions/quickstart" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Github size={14} className="mr-2" />
                            Learn how to enable discussions
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repositories;
