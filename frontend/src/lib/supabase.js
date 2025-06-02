import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

// Custom storage implementation that's more persistent
const customStorage = {
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      console.log(`Getting storage item ${key}:`, item ? 'found' : 'not found');
      return item;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      console.log(`Setting storage item ${key}`);
      localStorage.setItem(key, value);
      // Also set a backup in sessionStorage
      sessionStorage.setItem(key + '_backup', value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: (key) => {
    try {
      console.log(`Removing storage item ${key}`);
      localStorage.removeItem(key);
      sessionStorage.removeItem(key + '_backup');
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }
};

// Create Supabase client with enhanced options for better session management
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: customStorage,
    storageKey: 'supabase.auth.token',
    debug: true // Enable debug mode to see what's happening
  },
  realtime: {
    timeout: 60000,
    heartbeatIntervalMs: 30000
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'slack-clone-frontend'
    }
  }
});

// Session monitoring utilities
export const sessionUtils = {
  // Check if session is valid
  async isSessionValid() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  },

  // Get session info for debugging
  async getSessionInfo() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        return { valid: false, error: error?.message || 'No session' };
      }
      
      return {
        valid: true,
        expiresAt: new Date(session.expires_at * 1000),
        timeUntilExpiry: (session.expires_at * 1000) - Date.now(),
        user: session.user?.email
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  // Manually refresh session
  async refreshSession() {
    try {
      const { error } = await supabase.auth.refreshSession();
      return { success: !error, error: error?.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Force session recovery from backup storage
  async recoverSession() {
    try {
      const backupSession = sessionStorage.getItem('supabase.auth.token_backup');
      if (backupSession) {
        console.log('Attempting to recover session from backup...');
        const sessionData = JSON.parse(backupSession);
        
        const { error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token
        });
        
        return { success: !error, error: error?.message };
      }
      return { success: false, error: 'No backup session found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};