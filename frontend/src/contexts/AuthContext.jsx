import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { signIn, signUp, signOut, getCurrentUser } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        const { data } = await getCurrentUser();
        setUser(data.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data } = await getCurrentUser();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.data.subscription.unsubscribe();
  }, []);
  
  // Expose the authentication context
  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      const result = await signIn(email, password);
      if (!result.error) {
        const { data } = await getCurrentUser();
        setUser(data.user || null);
      }
      return result;
    },
    signUp: async (email, password, userData) => {
      return await signUp(email, password, userData);
    },
    signOut: async () => {
      const result = await signOut();
      if (!result.error) {
        setUser(null);
      }
      return result;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 