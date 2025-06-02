import { createContext, useContext, useState, useEffect } from 'react';
import { 
  simpleSignIn, 
  simpleSignUp, 
  simpleSignOut, 
  simpleGetCurrentUser 
} from '../lib/simple-auth';
import { supabase } from '../lib/supabase';

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

  // Function to fetch and set current user
  const fetchAndSetUser = async () => {
    try {
      console.log('Fetching current user...');
      setLoading(true);
      
      const { user: currentUser } = await simpleGetCurrentUser();
      
      console.log('Current user:', currentUser ? 'Found' : 'Not found');
      setUser(currentUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider initialized');
    
    // Check active sessions and sets the user
    fetchAndSetUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      
      if (session) {
        await fetchAndSetUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Ensure loading is set to false after a timeout as a fallback
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Expose the authentication context
  const value = {
    user,
    loading,
    signIn: async (email, password) => {
      try {
        setLoading(true);
        console.log('Signing in...');
        
        const result = await simpleSignIn(email, password);
        
        if (result.success) {
          console.log('Sign in successful');
          setUser(result.user);
        } else {
          console.error('Sign in failed:', result.error);
        }
        
        setLoading(false);
        return result;
      } catch (error) {
        console.error('Error in signIn function:', error);
        setLoading(false);
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    signUp: async (email, password, userData) => {
      try {
        return await simpleSignUp(email, password, userData);
      } catch (error) {
        console.error('Error in signUp function:', error);
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
    signOut: async () => {
      try {
        setLoading(true);
        const result = await simpleSignOut();
        setUser(null);
        setLoading(false);
        return result;
      } catch (error) {
        console.error('Error in signOut function:', error);
        setLoading(false);
        return { success: false, error: 'An unexpected error occurred' };
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 