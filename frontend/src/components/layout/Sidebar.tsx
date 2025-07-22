import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  PieChart, 
  Settings, 
  Upload,
  Tag,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Stats'
  },
  {
    name: 'Trades',
    href: '/trades',
    icon: TrendingUp,
    description: 'Trade History'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Performance Analysis'
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'Trading Calendar'
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: FileText,
    description: 'Trading Notes'
  },
  {
    name: 'Tags',
    href: '/tags',
    icon: Tag,
    description: 'Manage Tags'
  }
];

const quickActions = [
  {
    name: 'Add Trade',
    icon: TrendingUp,
    color: 'from-profit-500 to-profit-600',
    action: 'add-trade'
  },
  {
    name: 'Import CSV',
    icon: Upload,
    color: 'from-blue-500 to-blue-600',
    action: 'import-csv'
  },
  {
    name: 'Quick Analysis',
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    action: 'quick-analysis'
  }
];

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleQuickAction = (action: string) => {
    // TODO: Implement quick actions
    console.log('Quick action:', action);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside 
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:pt-16 lg:z-40 transition-all duration-300",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex-1 flex flex-col glass-dark border-r border-slate-700/30">
          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="p-4 border-b border-slate-700/30">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.name}
                    onClick={() => handleQuickAction(action.action)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-white transition-all duration-200",
                      `bg-gradient-to-r ${action.color} hover:shadow-lg hover:scale-105`
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.name}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {isCollapsed ? "Menu" : "Navigation"}
            </h3>
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link to={item.href}>
                      <motion.div
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                        )}
                        whileHover={{ x: isActive ? 0 : 4 }}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive ? "text-blue-400" : "text-gray-400"
                        )} />
                        {!isCollapsed && (
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        )}
                        {isActive && !isCollapsed && (
                          <motion.div 
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-slate-700/30">
            <Link to="/settings">
              <motion.div
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                whileHover={{ x: 4 }}
              >
                <Settings className="w-5 h-5 text-gray-400" />
                {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
              </motion.div>
            </Link>

            {/* Collapse Toggle */}
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mt-4 w-full flex items-center justify-center p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay - TODO: Implement mobile menu */}
    </>
  );
};

export default Sidebar;