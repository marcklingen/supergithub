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
  MessageSquare,
  Info,
  Building2,
  Copy,
  Key,
  Shield,
  ExternalLink
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Repositories = () => {
  const [repoInput, setRepoInput] = useState('');
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
  const { repositories, addRepository, removeRepository, setActiveRepository } = useRepo();
  const { user, githubToken, session, setManualGithubToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [debugMode, setDebugMode] = useState(true);
  
  useEffect(() => {
    console.log("GitHub token available:", !!githubToken);
    console.log("Full session object:", JSON.stringify(session, null, 2));
    if (!githubToken) {
      console.log("User metadata:", user?.user_metadata);
      console.log("App metadata:", user?.app_metadata);
    }
  }, [githubToken, user, session]);
  
  const { 
    data: githubRepos, 
    isLoading: isLoadingRepos, 
    isError: isReposError,
    error,
    refetch
  } = useUserRepositories(githubToken);
  
  useEffect(() => {
    console.log("GitHub repos response:", githubRepos);
    console.log("GitHub repos error:", isReposError ? error : null);
  }, [githubRepos, isReposError, error]);

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

  const copyToken = () => {
    if (githubToken) {
      navigator.clipboard.writeText(githubToken);
      toast({
        title: "Token Copied",
        description: "GitHub token copied to clipboard"
      });
    }
  };

  const handleSetManualToken = () => {
    if (!manualTokenInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid GitHub token",
        variant: "destructive"
      });
      return;
    }

    if (!manualTokenInput.startsWith('ghp_') && !manualTokenInput.startsWith('github_pat_')) {
      toast({
        title: "Warning",
        description: "GitHub tokens typically start with 'ghp_' or 'github_pat_'. Please check your token.",
        variant: "warning"
      });
    }

    setManualGithubToken(manualTokenInput.trim());
    setTokenDialogOpen(false);
    setManualTokenInput('');
    toast({
      title: "Token Set",
      description: "GitHub token has been set successfully"
    });
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Repository Management</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDebugMode(!debugMode)}
            title="Toggle debug information"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">
          Connect GitHub repositories to manage their discussions
        </p>
        
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> 
              GitHub Token Status
            </CardTitle>
            <CardDescription>
              A GitHub token with proper scopes is required to access and interact with discussions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {githubToken ? (
              <div>
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-400">GitHub Token Available</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-500">
                    <div className="flex justify-between items-center">
                      <div>
                        <p>Your GitHub token is set and ready to use.</p>
                        <p className="text-xs mt-1">Token starts with: {githubToken.substring(0, 10)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={copyToken}
                        >
                          <Copy size={14} className="mr-1" />
                          Copy
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setTokenDialogOpen(true)}
                        >
                          <Key size={14} className="mr-1" />
                          Replace
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
                
                {isReposError && (
                  <Alert className="mt-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-800 dark:text-amber-400">Token Permission Issue</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-500">
                      <p>Your token may not have the required scopes:</p>
                      <ul className="list-disc ml-6 mt-1">
                        <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">repo</code> scope for repository access</li>
                        <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">write:discussion</code> scope for discussions</li>
                        <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">write:issue</code> scope may also be needed</li>
                      </ul>
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setTokenDialogOpen(true)}
                        >
                          <Key size={14} className="mr-1" />
                          Replace Token
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => window.open("https://github.com/settings/tokens/new", "_blank")}
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Create New Token
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div>
                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-800 dark:text-amber-400">GitHub Token Required</AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-500">
                    <p className="mb-2">You need a GitHub token to access and interact with discussions. This requires:</p>
                    <ul className="list-disc ml-6 mb-3">
                      <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">repo</code> scope for repository access</li>
                      <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">write:discussion</code> scope for discussions</li>
                      <li><code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">write:issue</code> scope may also be needed</li>
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={() => setTokenDialogOpen(true)}
                      >
                        <Key size={14} className="mr-1" />
                        Set Token Manually
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open("https://github.com/settings/tokens/new", "_blank")}
                      >
                        <ExternalLink size={14} className="mr-1" />
                        Create Token on GitHub
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/auth')}
                      >
                        <Github size={14} className="mr-1" />
                        Sign in with GitHub
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
        
        {debugMode && githubToken && (
          <Alert className="mb-8" variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>GitHub Token Debug Info</AlertTitle>
            <AlertDescription>
              <div>
                <p className="text-xs mt-2">Token length: {githubToken.length} characters</p>
                <p className="text-xs mt-1">Session available: {session ? 'Yes' : 'No'}</p>
                {session && <p className="text-xs mt-1">Session has provider_token: {session.provider_token ? 'Yes' : 'No'}</p>}
                <p className="text-xs mt-1">User authenticated: {user ? 'Yes' : 'No'}</p>
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => refetch()}
                  >
                    Retry API Request
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Set GitHub Token Manually
              </DialogTitle>
              <DialogDescription>
                <p className="mb-4">
                  Enter your GitHub personal access token with the following scopes:
                </p>
                <div className="bg-muted p-3 rounded-md mb-4">
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Go to <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 inline-flex">
                      GitHub Token Settings <ExternalLink size={12} />
                    </a></li>
                    <li>Enter a note like "SuperGitHub Discussions"</li>
                    <li>Set an expiration if desired</li>
                    <li>Check these scopes:
                      <ul className="list-disc pl-5 mt-1">
                        <li><code className="bg-background px-1 py-0.5 rounded">repo</code> (full control of repositories)</li>
                        <li><code className="bg-background px-1 py-0.5 rounded">write:discussion</code> (for discussions)</li>
                        <li><code className="bg-background px-1 py-0.5 rounded">write:issue</code> (may also be needed)</li>
                      </ul>
                    </li>
                    <li>Click "Generate token" and copy the generated token</li>
                  </ol>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="ghp_xxxxxxxxxxxxxxxx"
                value={manualTokenInput}
                onChange={(e) => setManualTokenInput(e.target.value)}
                className="mb-2"
                type="password"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your token is stored locally in your browser and is never sent to our servers.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTokenDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSetManualToken}>Save Token</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
                        <Key size={14} className="mr-2" />
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
                        {debugMode && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => refetch()}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Tabs defaultValue="all">
                      <TabsList className="mb-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="personal">Personal</TabsTrigger>
                        <TabsTrigger value="organization">Organization</TabsTrigger>
                      </TabsList>
                      
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
                      </TabsContent>
                    </Tabs>
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
