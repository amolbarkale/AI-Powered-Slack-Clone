import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  simpleSignIn, 
  simpleSignUp, 
  simpleSignOut, 
  simpleGetCurrentUser 
} from '../lib/simple-auth';
import { supabase } from '../lib/supabase';
import { sessionPersistence } from '../lib/sessionPersistence';

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
  const sessionCheckInterval = useRef(null);
  const lastActivity = useRef(Date.now());

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
      setLoading(false);
    }
  };

  // Setup session persistence callbacks
  useEffect(() => {
    // Handle session lost
    sessionPersistence.onSessionLost(() => {
      console.log('Session lost detected by persistence service');
      setUser(null);
      setAuthError('Session expired. Please sign in again.');
    });

    // Handle session recovered
    sessionPersistence.onSessionRecovered(() => {
      console.log('Session recovered by persistence service');
      fetchAndSetUser();
    });
  }, []);

  // Aggressive session monitoring
  const startSessionMonitoring = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          console.warn('Session lost during monitoring, attempting to maintain user state');
          // Don't immediately sign out, try to refresh first
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Failed to refresh session:', refreshError);
            setUser(null);
          } else {
            console.log('Session refreshed successfully');
          }
        } else {
          // Session is valid, update last activity
          lastActivity.current = Date.now();
        }
      } catch (error) {
        console.error('Error during session monitoring:', error);
      }
    }, 30000); // Check every 30 seconds
  };

  // Stop session monitoring
  const stopSessionMonitoring = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  };

  // Handle page visibility changes to maintain session
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && user) {
        console.log('Page became visible, checking session...');
        lastActivity.current = Date.now();
        
        try {
          // First try to get the current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            console.log('No session found on visibility change, attempting refresh...');
            
            // Try to refresh the session
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData.session) {
              console.log('Session refresh failed, user will be signed out');
              setUser(null);
            } else {
              console.log('Session refreshed successfully on visibility change');
              // Optionally re-fetch user data
              await fetchAndSetUser();
            }
          } else {
            console.log('Session valid after page visibility change');
          }
        } catch (error) {
          console.error('Error checking session on visibility change:', error);
        }
      }
    };

    const handleFocus = () => {
      if (user) {
        lastActivity.current = Date.now();
        handleVisibilityChange();
      }
    };

    const handleBeforeUnload = () => {
      // Save current session state before page unload
      if (user) {
        localStorage.setItem('slack_user_state', JSON.stringify({
          timestamp: Date.now(),
          userId: user.id,
          email: user.email
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  useEffect(() => {    
    // Check for saved user state on app start
    const savedUserState = localStorage.getItem('slack_user_state');
    if (savedUserState) {
      try {
        const { timestamp } = JSON.parse(savedUserState);
        // If saved state is less than 1 hour old, try to restore session
        if (Date.now() - timestamp < 3600000) {
          console.log('Found recent user state, attempting to restore session...');
        }
      } catch (error) {
        console.error('Error parsing saved user state:', error);
        localStorage.removeItem('slack_user_state');
      }
    }

    // Check active sessions and sets the user
    fetchAndSetUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      
      if (event === 'SIGNED_IN' && session) {
        await fetchAndSetUser();
        startSessionMonitoring();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        stopSessionMonitoring();
        localStorage.removeItem('slack_user_state');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed, updating user data');
        await fetchAndSetUser();
      } else if (!session && user) {
        // Session lost but we still have a user - this might be the issue
        console.warn('Session lost but user still exists, attempting recovery...');
        
        // Try one more time to get the session
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            console.log('Session definitely lost, signing out user');
            setUser(null);
            setLoading(false);
            stopSessionMonitoring();
          }
        }, 1000);
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
      stopSessionMonitoring();
    };
  }, []);

  // Start monitoring when user is set
  useEffect(() => {
    if (user) {
      startSessionMonitoring();
    } else {
      stopSessionMonitoring();
    }

    return () => {
      stopSessionMonitoring();
    };
  }, [user]);
  
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
          lastActivity.current = Date.now();
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
        stopSessionMonitoring();
        localStorage.removeItem('slack_user_state');
        
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