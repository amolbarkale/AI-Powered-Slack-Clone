import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

// A “real” localStorage proxy so that browser StorageEvents fire between tabs.
// We also keep your sessionStorage backup, but we do NOT swallow the real storage events.
const customStorage = {
  getItem: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      console.log(`Getting storage item ${key}:`, item ? 'found' : 'not found');
      return item;
    } catch (err) {
      console.error('Error getting item from storage:', err);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      console.log(`Setting storage item ${key}`);
      window.localStorage.setItem(key, value);
      // backup in sessionStorage, in case you need to recover manually
      window.sessionStorage.setItem(key + '_backup', value);
    } catch (err) {
      console.error('Error setting item in storage:', err);
    }
  },
  removeItem: (key) => {
    try {
      console.log(`Removing storage item ${key}`);
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key + '_backup');
    } catch (err) {
      console.error('Error removing item from storage:', err);
    }
  }
};

// Create the Supabase client once, with multiTab enabled and your customStorage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // write session into localStorage
    autoRefreshToken: true,      // auto‐refresh the access token when it nears expiry
    detectSessionInUrl: true,     // only needed if you’re doing OAuth PKCE redirects
    flowType: 'pkce',             // only needed if you actually use PKCE
    storage: customStorage,       // let Supabase read/write via localStorage
    multiTab: true,               // listen to "storage" events from other tabs
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

// Session utilities remain the same
export const sessionUtils = {
  async isSessionValid() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return !error && !!session;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  },

  async getSessionInfo() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        return { valid: false, error: error?.message || 'No session' };
      }
      return {
        valid: true,
        expiresAt: new Date(session.expires_at * 1000),
        timeUntilExpiry: session.expires_at * 1000 - Date.now(),
        user: session.user?.email
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  async refreshSession() {
    try {
      const { error } = await supabase.auth.refreshSession();
      return { success: !error, error: error?.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async recoverSession() {
    try {
      const backupSession = window.sessionStorage.getItem('@supabase/auth-v1-expires-at_backup');
      if (backupSession) {
        console.log('Attempting to recover session from backup...');
        // Note: Supabase v2 sessions are split across multiple keys;
        // if you need a deep recovery, you’d have to rehydrate all keys
        // here. In most cases, letting Supabase auto‐refresh from localStorage is enough.
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
