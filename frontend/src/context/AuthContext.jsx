import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { simpleSignIn, simpleSignUp, simpleGetCurrentUser, simpleSignOut } from '../lib/simple-auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authOperation, setAuthOperation] = useState(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    async function getInitialUser() {
      try {
        setLoading(true);
        
        // Get current user with timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );
        
        const userPromise = simpleGetCurrentUser();
        
        const { user } = await Promise.race([userPromise, timeoutPromise]);
        
        if (mounted) {
          setUser(user);
          setAuthError(null);
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
        if (mounted) {
          setAuthError('Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const { user } = await simpleGetCurrentUser();
            if (mounted) {
              setUser(user);
            }
          } catch (error) {
            console.error('Error getting user after sign in:', error);
          } finally {
            if (mounted) {
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    );

    getInitialUser();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  async function signUp(email, password, userData = {}) {
    try {
      setAuthOperation('signup');
      setLoading(true);
      setAuthError(null);
      
      const result = await simpleSignUp(email, password, userData);
      
      if (!result.success) {
        setAuthError(result.error || 'Failed to sign up');
        return { success: false, error: result.error };
      }
      
      return { success: true, message: result.message };
    } catch (error) {
      console.error('Error in sign up:', error);
      setAuthError(error.message || 'An unexpected error occurred');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setAuthOperation(null);
    }
  }

  // Sign in function
  async function signIn(email, password) {
    try {
      setAuthOperation('signin');
      setLoading(true);
      setAuthError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign in timeout')), 10000)
      );
      
      const signInPromise = simpleSignIn(email, password);
      
      const result = await Promise.race([signInPromise, timeoutPromise]);
      
      if (!result.success) {
        setAuthError(result.error || 'Failed to sign in');
        return { success: false, error: result.error };
      }
      
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.error('Error in sign in:', error);
      setAuthError(error.message || 'An unexpected error occurred');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setAuthOperation(null);
    }
  }

  // Sign out function
  async function signOut() {
    try {
      setAuthOperation('signout');
      setLoading(true);
      
      await simpleSignOut();
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error in sign out:', error);
      setAuthError(error.message || 'Failed to sign out');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      setAuthOperation(null);
    }
  }

  // Reset auth error
  function resetAuthError() {
    setAuthError(null);
  }

  const value = {
    user,
    loading,
    authError,
    authOperation,
    signUp,
    signIn,
    signOut,
    resetAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 