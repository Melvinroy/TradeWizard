import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse } from '../lib/types';
import { authApi } from '../lib/api';
import { storage } from '../lib/utils';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);
      const authData: AuthResponse = response.data;
      
      // Store token and user data
      storage.set('token', authData.access_token);
      storage.set('user', authData.user);
      setUser(authData.user);
      
      toast.success('Welcome back!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.register(email, password);
      const authData: AuthResponse = response.data;
      
      // Store token and user data
      storage.set('token', authData.access_token);
      storage.set('user', authData.user);
      setUser(authData.user);
      
      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    storage.remove('token');
    storage.remove('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.get('token');
      const storedUser = storage.get('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          await authApi.me();
          setUser(storedUser);
        } catch (error) {
          // Token is invalid, clear storage
          storage.remove('token');
          storage.remove('user');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};