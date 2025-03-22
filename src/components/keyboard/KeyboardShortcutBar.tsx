
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Keyboard, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Command, MessageCircle, ExternalLink } from 'lucide-react';

interface ShortcutItemProps {
  keys: string[];
  label: string;
  icon?: React.ReactNode;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ keys, label, icon }) => {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border shadow-sm">{key}</kbd>
            {index < keys.length - 1 && <span className="text-muted-foreground">/</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const KeyboardShortcutBar: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/discussions' && !location.pathname.includes('/discussions/');
  const isDiscussionDetail = location.pathname.includes('/discussions/');
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm z-50 py-2 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Keyboard size={14} className="text-muted-foreground" />
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {isDashboard && (
            <>
              <ShortcutItem 
                keys={['j', '↓']} 
                label="Next discussion" 
                icon={<ChevronDown size={14} />} 
              />
              <ShortcutItem 
                keys={['k', '↑']} 
                label="Previous discussion" 
                icon={<ChevronUp size={14} />} 
              />
              <ShortcutItem 
                keys={['Enter']} 
                label="Open selected" 
              />
              <ShortcutItem 
                keys={['1-9']} 
                label="Switch category" 
              />
            </>
          )}
          
          {isDiscussionDetail && (
            <>
              <ShortcutItem 
                keys={['j']} 
                label="Next discussion" 
                icon={<ChevronDown size={14} />} 
              />
              <ShortcutItem 
                keys={['k']} 
                label="Previous discussion" 
                icon={<ChevronUp size={14} />} 
              />
              <ShortcutItem 
                keys={['Esc']} 
                label="Back to list" 
                icon={<ChevronLeft size={14} />} 
              />
              <ShortcutItem 
                keys={['r']} 
                label="Reply" 
                icon={<MessageCircle size={14} />} 
              />
              <ShortcutItem 
                keys={['o']} 
                label="Open in GitHub" 
                icon={<ExternalLink size={14} />} 
              />
            </>
          )}
          
          <ShortcutItem 
            keys={['⌘', 'k']} 
            label="Command menu" 
            icon={<Command size={14} />} 
          />
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutBar;
