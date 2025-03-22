
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Copy, Github } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

const UserProfile: React.FC = () => {
  const { user, signOut, githubToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = githubToken || user?.user_metadata?.provider_token;
  const avatarUrl = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email || 'User';
  
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("Navigating to /auth after sign out");
      navigate('/auth', { replace: true });
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account"
      });
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive"
      });
      // Force navigation to auth page even if sign out fails
      navigate('/auth', { replace: true });
    }
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast({
        title: "Token copied",
        description: "GitHub token copied to clipboard"
      });
    } else {
      toast({
        title: "No token available",
        description: "Please sign in with GitHub to get a token",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="p-4">
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
          <DropdownMenuItem onClick={handleCopyToken}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Copy GitHub Token</span>
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
    </div>
  );
};

export default UserProfile;
