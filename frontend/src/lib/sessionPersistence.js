import { supabase } from './supabase';

class SessionPersistenceService {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.lastSessionCheck = null;
    this.sessionLostCallbacks = [];
    this.sessionRecoveredCallbacks = [];
  }

  // Add callback for when session is lost
  onSessionLost(callback) {
    this.sessionLostCallbacks.push(callback);
  }

  // Add callback for when session is recovered
  onSessionRecovered(callback) {
    this.sessionRecoveredCallbacks.push(callback);
  }

  // Start monitoring session
  startMonitoring() {
    if (this.isMonitoring) return;
    
    console.log('Starting session persistence monitoring...');
    this.isMonitoring = true;
    
    // Check session every 15 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkAndMaintainSession();
    }, 15000);

    // Also check on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => this.checkAndMaintainSession(), 1000);
      }
    });

    // Check on window focus
    window.addEventListener('focus', () => {
      setTimeout(() => this.checkAndMaintainSession(), 1000);
    });
  }

  // Stop monitoring session
  stopMonitoring() {
    console.log('Stopping session persistence monitoring...');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Check and maintain session
  async checkAndMaintainSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        await this.attemptSessionRecovery();
        return;
      }

      if (!session) {
        console.warn('No session found during monitoring');
        await this.attemptSessionRecovery();
        return;
      }

      // Check if session is about to expire (within 5 minutes)
      const expiresAt = session.expires_at * 1000;
      const timeUntilExpiry = expiresAt - Date.now();
      
      if (timeUntilExpiry < 300000) { // 5 minutes
        console.log('Session expiring soon, refreshing...');
        await this.refreshSession();
      }

      this.lastSessionCheck = Date.now();
    } catch (error) {
      console.error('Error during session monitoring:', error);
      await this.attemptSessionRecovery();
    }
  }

  // Attempt to refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        await this.attemptSessionRecovery();
        return false;
      }

      if (data.session) {
        console.log('Session refreshed successfully');
        this.notifySessionRecovered();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }

  // Attempt session recovery using various methods
  async attemptSessionRecovery() {
    console.log('Attempting session recovery...');

    // Method 1: Try to refresh the current session
    const refreshSuccess = await this.refreshSession();
    if (refreshSuccess) {
      return true;
    }

    // Method 2: Try to recover from backup storage
    const backupSuccess = await this.recoverFromBackup();
    if (backupSuccess) {
      return true;
    }

    // Method 3: Try to get session again (sometimes it's just a temporary issue)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Session recovered after retry');
        this.notifySessionRecovered();
        return true;
      }
    } catch (error) {
      console.error('Session retry failed:', error);
    }

    // All recovery methods failed
    console.error('All session recovery methods failed');
    this.notifySessionLost();
    return false;
  }

  // Recover session from backup storage
  async recoverFromBackup() {
    try {
      const backupSession = sessionStorage.getItem('supabase.auth.token_backup');
      if (!backupSession) {
        return false;
      }

      console.log('Attempting to recover session from backup...');
      const sessionData = JSON.parse(backupSession);
      
      const { error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token
      });
      
      if (error) {
        console.error('Backup session recovery failed:', error);
        return false;
      }

      console.log('Session recovered from backup successfully');
      this.notifySessionRecovered();
      return true;
    } catch (error) {
      console.error('Error recovering from backup:', error);
      return false;
    }
  }

  // Notify callbacks that session was lost
  notifySessionLost() {
    this.sessionLostCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in session lost callback:', error);
      }
    });
  }

  // Notify callbacks that session was recovered
  notifySessionRecovered() {
    this.sessionRecoveredCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in session recovered callback:', error);
      }
    });
  }

  // Force session validation
  async validateSession() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return !error && !!user;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}

// Create singleton instance
export const sessionPersistence = new SessionPersistenceService();

// Auto-start monitoring when module is loaded
if (typeof window !== 'undefined') {
  // Start monitoring after a short delay to allow app initialization
  setTimeout(() => {
    sessionPersistence.startMonitoring();
  }, 2000);
} 