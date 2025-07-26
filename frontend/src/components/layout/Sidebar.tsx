import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen,
  TrendingUp,
  Building2,
  Search,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  PieChart,
  BarChart3,
  Activity,
  Users,
  Bell,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  currentModule?: string;
  onModuleChange?: (module: string) => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  isActive?: boolean;
  isComingSoon?: boolean;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'trading-journal',
    label: 'Trading Journal',
    icon: BookOpen,
    description: 'Track and analyze your trades',
    isActive: true
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Advanced performance metrics',
    isComingSoon: true
  },
  {
    id: 'options-flow',
    label: 'Options Flow',
    icon: TrendingUp,
    description: 'Real-time options activity',
    isComingSoon: true
  },
  {
    id: 'congress-trades',
    label: 'Congress Trades',
    icon: Building2,
    description: 'Congressional trading activity',
    isComingSoon: true
  },
  {
    id: 'market-scanner',
    label: 'Market Scanner',
    icon: Search,
    description: 'Find trading opportunities',
    isComingSoon: true
  },
  {
    id: 'strategy-builder',
    label: 'Strategy Builder',
    icon: Target,
    description: 'Create and backtest strategies',
    isComingSoon: true
  },
  {
    id: 'portfolio-tracker',
    label: 'Portfolio',
    icon: PieChart,
    description: 'Portfolio management',
    isComingSoon: true
  },
  {
    id: 'community',
    label: 'Community',
    icon: Users,
    description: 'Connect with traders',
    isComingSoon: true
  }
];

const bottomItems: NavigationItem[] = [
  {
    id: 'alerts',
    label: 'Alerts',
    icon: Bell,
    description: 'Trading alerts and notifications',
    isComingSoon: true
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Application settings'
  }
];

const Sidebar: React.FC<SidebarProps> = ({
  currentModule = 'trading-journal',
  onModuleChange,
  className
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = (item: NavigationItem) => {
    if (item.isComingSoon) return;
    
    if (onModuleChange) {
      onModuleChange(item.id);
    }
  };

  const SidebarItem: React.FC<{ item: NavigationItem; isBottom?: boolean }> = ({ 
    item, 
    isBottom = false 
  }) => (
    <motion.div
      className={cn(
        'relative group cursor-pointer',
        item.isComingSoon && 'cursor-not-allowed'
      )}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      onClick={() => handleItemClick(item)}
      whileHover={!item.isComingSoon ? { 
        x: 2,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={!item.isComingSoon ? { 
        scale: 0.98,
        transition: { duration: 0.1, ease: "easeInOut" }
      } : {}}
    >
      <div
        className={cn(
          'flex items-center px-4 py-4 mx-3 rounded-xl transition-all duration-200',
          'hover:bg-white/8 hover:border-white/15 border border-transparent',
          item.id === currentModule && 'bg-blue-500/15 border-blue-500/30 shadow-lg shadow-blue-500/10',
          item.isComingSoon && 'opacity-60',
          !isCollapsed && 'justify-start',
          isCollapsed && 'justify-center'
        )}
      >
        {/* Icon */}
        <div className={cn(
          'flex items-center justify-center min-w-[24px]',
          !isCollapsed && 'mr-4',
          item.id === currentModule && 'text-blue-400',
          item.id !== currentModule && 'text-gray-400 group-hover:text-white'
        )}>
          <item.icon className="w-6 h-6" />
        </div>

        {/* Label */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.2, delay: 0.1, ease: "easeOut" }
              }}
              exit={{ 
                opacity: 0, 
                x: -10,
                transition: { duration: 0.15, ease: "easeIn" }
              }}
              className="flex items-center justify-between w-full min-w-0"
            >
              <div className="flex flex-col flex-1">
                <span className={cn(
                  'text-base font-semibold transition-colors leading-tight',
                  item.id === currentModule && 'text-white',
                  item.id !== currentModule && 'text-gray-200 group-hover:text-white'
                )}>
                  {item.label}
                </span>
                {!isBottom && item.description && (
                  <span className={cn(
                    'text-sm transition-colors mt-1 leading-tight',
                    item.id === currentModule && 'text-blue-200',
                    item.id !== currentModule && 'text-gray-400 group-hover:text-gray-300',
                    item.isComingSoon && 'text-gray-500'
                  )}>
                    {item.description}
                  </span>
                )}
              </div>

              {/* Coming Soon Badge */}
              {item.isComingSoon && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 text-xs font-medium bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40 shrink-0"
                >
                  Soon
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tooltip for collapsed state */}
      {isCollapsed && hoveredItem === item.id && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50"
        >
          <div className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 shadow-xl">
            <div className="text-sm font-medium text-white">{item.label}</div>
            {item.description && (
              <div className="text-xs text-gray-400 mt-1">{item.description}</div>
            )}
            {item.isComingSoon && (
              <div className="text-xs text-amber-400 mt-1">Coming Soon</div>
            )}
          </div>
        </motion.div>
      )}

      {/* Active indicator */}
      {item.id === currentModule && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"
        />
      )}
    </motion.div>
  );

  return (
    <motion.aside
      className={cn(
        'flex flex-col h-full bg-gradient-to-b from-gray-900/95 to-gray-800/95',
        'backdrop-blur-xl border-r border-gray-700/50',
        'z-40 overflow-hidden',
        'fixed lg:relative inset-y-0 left-0', // Fixed position for mobile, relative for desktop
        isCollapsed ? 'w-16' : 'w-80',
        className
      )}
      initial={false}
      animate={{ 
        width: isCollapsed ? 64 : 320,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { duration: 0.2, delay: 0.1, ease: "easeOut" }
              }}
              exit={{ 
                opacity: 0, 
                x: -10,
                transition: { duration: 0.15, ease: "easeIn" }
              }}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">TradeWizard</h1>
                <p className="text-xs text-gray-400">Professional Trading Platform</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle */}
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50',
            'border border-gray-600/50 hover:border-gray-500/50',
            'text-gray-400 hover:text-white transition-all duration-200'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-2">
          {navigationItems.map(item => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700/50 py-6">
        <nav className="space-y-2">
          {bottomItems.map(item => (
            <SidebarItem key={item.id} item={item} isBottom />
          ))}
        </nav>
      </div>

      {/* Version Info */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              transition: { duration: 0.2, delay: 0.1, ease: "easeOut" }
            }}
            exit={{ 
              opacity: 0, 
              x: -10,
              transition: { duration: 0.15, ease: "easeIn" }
            }}
            className="p-4 border-t border-gray-700/50"
          >
            <div className="text-center">
              <p className="text-xs text-gray-500">Version 1.0.0</p>
              <p className="text-xs text-gray-600 mt-1">Phase 2A: UI Enhancement</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default Sidebar;