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
  const [authError, setAuthError] = useState(null);

  // Function to fetch and set current user with timeout
  const fetchAndSetUser = async () => {
    try {
      console.log('Fetching current user...');
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User fetch timeout')), 5000)
      );
      
      const userPromise = simpleGetCurrentUser();
      
      const { user: currentUser } = await Promise.race([userPromise, timeoutPromise]);
      
      console.log('Current user:', currentUser ? 'Found' : 'Not found');
      setUser(currentUser);
      
      if (currentUser) {
        setAuthError(null);
      }
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
    authError,
    signIn: async (email, password) => {
      try {
        setLoading(true);
        setAuthError(null);
        console.log('Signing in with:', email);
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sign in timeout after 10 seconds')), 10000)
        );
        
        const signInPromise = simpleSignIn(email, password);
        
        let result;
        try {
          result = await Promise.race([signInPromise, timeoutPromise]);
        } catch (raceError) {
          console.error('Timeout or error during sign in:', raceError);
          setAuthError(raceError.message || 'Sign in timed out');
          return { success: false, error: raceError.message || 'Sign in timed out' };
        }
        
        if (result.success) {
          console.log('Sign in successful, setting user');
          setUser(result.user);
          return { success: true };
        } else {
          console.error('Sign in failed:', result.error);
          setAuthError(result.error);
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Error in signIn function:', error);
        setAuthError(error.message || 'An unexpected error occurred');
        return { success: false, error: error.message || 'An unexpected error occurred' };
      } finally {
        setLoading(false);
      }
    },
    signUp: async (email, password, userData) => {
      try {
        setLoading(true);
        setAuthError(null);
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sign up timeout after 10 seconds')), 10000)
        );
        
        const signUpPromise = simpleSignUp(email, password, userData);
        
        let result;
        try {
          result = await Promise.race([signUpPromise, timeoutPromise]);
        } catch (raceError) {
          console.error('Timeout or error during sign up:', raceError);
          setAuthError(raceError.message || 'Sign up timed out');
          return { success: false, error: raceError.message || 'Sign up timed out' };
        }
        
        if (!result.success) {
          setAuthError(result.error);
        }
        
        return result;
      } catch (error) {
        console.error('Error in signUp function:', error);
        setAuthError(error.message || 'An unexpected error occurred');
        return { success: false, error: error.message || 'An unexpected error occurred' };
      } finally {
        setLoading(false);
      }
    },
    signOut: async () => {
      try {
        setLoading(true);
        setAuthError(null);
        
        const result = await simpleSignOut();
        setUser(null);
        
        return result;
      } catch (error) {
        console.error('Error in signOut function:', error);
        setAuthError(error.message || 'Error signing out');
        return { success: false, error: 'Error signing out' };
      } finally {
        setLoading(false);
      }
    },
    resetAuthError: () => {
      setAuthError(null);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 