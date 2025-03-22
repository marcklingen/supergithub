
import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => {
        if (value) setTheme(value);
      }}
      className="ml-auto"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="light" aria-label="Light Mode" size="sm">
              <Sun size={16} />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Light Mode</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="dark" aria-label="Dark Mode" size="sm">
              <Moon size={16} />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dark Mode</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="system" aria-label="System Mode" size="sm">
              <Monitor size={16} />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>
            <p>System Mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </ToggleGroup>
  );
};

export default ThemeSwitcher;
