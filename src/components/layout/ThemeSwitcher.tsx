
import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getThemeIcon = (themeValue: string | undefined) => {
    switch(themeValue) {
      case 'light': return <Sun size={16} />;
      case 'dark': return <Moon size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  return (
    <TooltipProvider>
      <div 
        className="relative ml-auto"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <button 
          aria-label={`Current theme: ${theme}`}
          className="flex items-center justify-center h-8 w-8 rounded-md text-sm bg-transparent hover:bg-muted transition-colors"
          onClick={() => setIsExpanded(prev => !prev)}
        >
          {getThemeIcon(theme)}
        </button>
        
        {isExpanded && (
          <div className="absolute right-0 top-full mt-1 p-1 bg-popover border rounded-md shadow-md animate-fade-in z-10 flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={`flex items-center justify-center h-8 w-8 rounded-md text-sm ${theme === 'light' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Light Mode</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={`flex items-center justify-center h-8 w-8 rounded-md text-sm ${theme === 'dark' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Dark Mode</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={`flex items-center justify-center h-8 w-8 rounded-md text-sm ${theme === 'system' ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setTheme('system')}
                >
                  <Monitor size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>System Mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ThemeSwitcher;
