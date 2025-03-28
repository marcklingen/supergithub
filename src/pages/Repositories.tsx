
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepo } from '@/contexts/RepoContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRepositories } from '@/lib/github';
import Navbar from '@/components/layout/Navbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Loader2, 
  GitBranch, 
  Star, 
  Plus, 
  Trash2, 
  Check, 
  Github,
  MessageSquare,
  Building2,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  Info,
  KeyRound
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import GitHubTokenDialog from '@/components/discussions/GitHubTokenDialog';

const Repositories = () => {
  const [repoInput, setRepoInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const { repositories, addRepository, removeRepository, setActiveRepository } = useRepo();
  const { user, githubToken, signOut, setManualGithubToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    data: githubRepos, 
    isLoading: isLoadingRepos, 
    isError: isReposError,
    error,
    refetch
  } = useUserRepositories(githubToken);
  
  useEffect(() => {
    if (githubRepos?._orgAccessError) {
      console.log("Limited organization access detected");
    }
  }, [githubRepos]);

  const getReposWithDiscussions = () => {
    if (!githubRepos?.viewer) return [];
    
    const personalRepos = githubRepos.viewer.repositories?.nodes
      ?.filter((repo: any) => repo.hasDiscussionsEnabled) || [];
    
    const orgRepos = githubRepos.viewer.organizations?.nodes
      ?.flatMap((org: any) => 
        org.repositories?.nodes
          ?.filter((repo: any) => repo.hasDiscussionsEnabled) || []
      ) || [];
    
    return [...personalRepos, ...orgRepos];
  };

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

  const handleReauthWithOrgAccess = () => {
    navigate('/auth?reauth=true&scope=read:org');
    
    toast({
      title: "GitHub Authentication",
      description: "Redirecting to GitHub to update scope permissions",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Repository Management</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Connect GitHub repositories to manage their discussions
        </p>
        
        <GitHubTokenDialog
          open={tokenDialogOpen}
          onOpenChange={setTokenDialogOpen}
          onSetToken={setManualGithubToken}
          tokenInput={tokenInput}
          setTokenInput={setTokenInput}
        />
        
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
                {!githubToken && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>GitHub Authentication Required</AlertTitle>
                    <AlertDescription>
                      <p>To see your GitHub repositories, you need to provide a GitHub token.</p>
                      <Button 
                        className="mt-2" 
                        size="sm" 
                        onClick={() => setTokenDialogOpen(true)}
                      >
                        <KeyRound size={14} className="mr-2" />
                        Set GitHub Token
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
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
                          {(error as Error)?.message || 'Please check your GitHub token permissions or connection'}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => refetch()}
                        >
                          Retry
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue="all" className="w-full">
                    <div className="flex items-center mb-4 justify-between">
                      <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="organization">
                          Organization
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="all" className="space-y-4">
                      {getReposWithDiscussions().length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>No repositories with discussions enabled found</p>
                          <p className="text-sm mt-2">
                            Enable discussions for your repositories on GitHub first
                          </p>
                        </div>
                      ) : (
                        getReposWithDiscussions().map((repo: any) => {
                          const isConnected = repositories.some(r => 
                            r.fullName === repo.nameWithOwner
                          );
                          const isOrg = repo.owner.login !== githubRepos?.viewer?.login;
                          
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
                                    
                                    {isOrg && (
                                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs flex items-center gap-1">
                                        <Building2 size={12} />
                                        Org
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
                        })
                      )}
                    </TabsContent>
                    
                    <TabsContent value="personal" className="space-y-4">
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
                          <p>No personal repositories with discussions enabled found</p>
                          <p className="text-sm mt-2">
                            Enable discussions for your repositories on GitHub first
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="organization" className="space-y-4">
                      {githubRepos?._orgAccessError ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Building2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>Limited access to organization repositories</p>
                          <p className="text-sm mt-2">
                            You can only see repositories from organizations that have granted you access
                          </p>
                        </div>
                      ) : (
                        <>
                          {(!githubRepos?.viewer?.organizations?.nodes ||
                            !githubRepos?.viewer?.organizations?.nodes.some((org: any) => 
                              org.repositories?.nodes?.some((repo: any) => repo.hasDiscussionsEnabled)
                            )) && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Building2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                              <p>No organization repositories with discussions enabled found</p>
                              <p className="text-sm mt-2">
                                Enable discussions for your organization repositories on GitHub first
                              </p>
                            </div>
                          )}
                          
                          {githubRepos?.viewer?.organizations?.nodes
                            ?.flatMap((org: any) => 
                              org.repositories?.nodes
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
                                            
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs flex items-center gap-1">
                                              <Building2 size={12} />
                                              Org
                                            </span>
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
                                })
                            )}
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
              
              {githubToken && githubRepos?._orgAccessError && (
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleReauthWithOrgAccess}
                    className="gap-2"
                  >
                    <Github size={16} />
                    Grant access to more repositories
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Repositories;
