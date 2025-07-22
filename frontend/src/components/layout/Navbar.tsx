import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <motion.nav 
      className="sticky top-0 z-50 glass-dark border-b border-slate-700/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <motion.div 
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <h1 className="text-2xl font-bold gradient-text">TradeWizard</h1>
            </motion.div>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search trades, symbols..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <motion.button
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-loss-500 rounded-full"></span>
            </motion.button>

            {/* Settings */}
            <motion.button
              className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-2 text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.email?.split('@')[0]}
                </span>
              </motion.button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-56 glass-dark border border-slate-700/50 rounded-xl shadow-xl py-2"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 py-2 border-b border-slate-700/30">
                    <p className="text-sm font-medium text-white">{user?.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.subscription_tier} Plan</p>
                  </div>
                  
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200">
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200">
                    Billing
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200">
                    Help & Support
                  </button>
                  
                  <div className="border-t border-slate-700/30 mt-2 pt-2">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-loss-400 hover:text-loss-300 hover:bg-slate-700/50 transition-colors duration-200 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search - Show when menu is open */}
      {isMobileMenuOpen && (
        <motion.div 
          className="lg:hidden border-t border-slate-700/30 p-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search trades, symbols..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;