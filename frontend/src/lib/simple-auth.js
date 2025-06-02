// Simple authentication helper functions
import { supabase } from './supabase';

// Simple sign up function
export async function simpleSignUp(email, password, userData = {}) {
  console.log('Simple sign up with:', email);
  
  try {
    // 1. Sign up with Supabase Auth
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName || email
        }
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
    
    // 2. Immediately create user record without waiting for trigger
    if (authData?.user) {
      try {
        // Create workspace
        const { data: workspace, error: wsError } = await supabase
          .from('workspaces')
          .insert([{ name: 'My Workspace' }])
          .select()
          .single();
          
        if (wsError) {
          console.error('Error creating workspace:', wsError);
        } else {
          // Create user
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{
              auth_id: authData.user.id,
              full_name: userData.fullName || authData.user.email.split('@')[0],
              email: authData.user.email,
              workspace_id: workspace.id,
              avatar_url: userData.avatarUrl || null
            }])
            .select()
            .single();
            
          if (userError) {
            console.error('Error creating user record:', userError);
          } else {
            // Update workspace with user ID
            await supabase
              .from('workspaces')
              .update({ created_by: newUser.id })
              .eq('id', workspace.id);
              
            // Create default channel
            await supabase
              .from('channels')
              .insert([{
                workspace_id: workspace.id,
                name: 'general',
                description: 'General discussion',
                created_by: newUser.id
              }]);
          }
        }
      } catch (err) {
        console.error('Error in manual user creation:', err);
      }
    }
    
    console.log('Sign up successful');
    return { 
      success: true, 
      message: 'Account created! Please check your email to confirm your account.'
    };
  } catch (err) {
    console.error('Unexpected error during sign up:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Simple sign in function
export async function simpleSignIn(email, password) {
  console.log('Simple sign in with:', email);
  
  try {
    // 1. Sign in with Supabase Auth - DIRECT APPROACH
    let authResponse;
    try {
      authResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        console.error('Auth API error:', errorData);
        return { success: false, error: errorData.error_description || 'Authentication failed' };
      }
    } catch (fetchError) {
      console.error('Fetch error during auth:', fetchError);
      return { success: false, error: 'Connection error during authentication' };
    }
    
    // 2. Use the standard Supabase client as fallback if direct approach fails
    if (!authResponse || !authResponse.ok) {
      console.log('Falling back to Supabase client for auth...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
      }
      
      if (!data || !data.user) {
        return { success: false, error: 'No user returned from authentication' };
      }
      
      // Get user data immediately after authentication
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .single();
      
      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        // Use auth user data as fallback
        const tempUserData = {
          id: 'temp-' + Date.now(),
          auth_id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
          email: data.user.email
        };
        
        return { 
          success: true, 
          user: { ...data.user, ...tempUserData },
          session: data.session
        };
      }
      
      return { 
        success: true, 
        user: { ...data.user, ...userData },
        session: data.session
      };
    }
    
    // 3. Process successful direct authentication
    const authData = await authResponse.json();
    
    // Get user from the access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authData.access_token);
    
    if (userError || !user) {
      console.error('Error getting user from token:', userError);
      return { success: false, error: 'Failed to get user data' };
    }
    
    // Set the session in Supabase client
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token
    });
    
    if (sessionError) {
      console.error('Error setting session:', sessionError);
    }
    
    // Get user data from database
    const { data: userData, error: dbUserError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    
    // Create user record if it doesn't exist
    if (dbUserError || !userData) {
      console.log('User record not found, creating...');
      
      try {
        // Create workspace
        const { data: workspace, error: wsError } = await supabase
          .from('workspaces')
          .insert([{ name: 'My Workspace' }])
          .select()
          .single();
          
        if (wsError) {
          console.error('Error creating workspace:', wsError);
          // Use auth user data as fallback
          const tempUserData = {
            id: 'temp-' + Date.now(),
            auth_id: user.id,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email
          };
          
          return { 
            success: true, 
            user: { ...user, ...tempUserData },
            session: {
              access_token: authData.access_token,
              refresh_token: authData.refresh_token,
              expires_at: authData.expires_at
            }
          };
        }
        
        // Create user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            auth_id: user.id,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email,
            workspace_id: workspace.id
          }])
          .select()
          .single();
          
        if (createError || !newUser) {
          console.error('Error creating user record:', createError);
          // Use auth user data as fallback
          const tempUserData = {
            id: 'temp-' + Date.now(),
            auth_id: user.id,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email,
            workspace_id: workspace.id
          };
          
          return { 
            success: true, 
            user: { ...user, ...tempUserData },
            session: {
              access_token: authData.access_token,
              refresh_token: authData.refresh_token,
              expires_at: authData.expires_at
            }
          };
        }
        
        // Update workspace with user ID
        await supabase
          .from('workspaces')
          .update({ created_by: newUser.id })
          .eq('id', workspace.id);
          
        // Create default channel
        await supabase
          .from('channels')
          .insert([{
            workspace_id: workspace.id,
            name: 'general',
            description: 'General discussion',
            created_by: newUser.id
          }]);
          
        return { 
          success: true, 
          user: { ...user, ...newUser },
          session: {
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            expires_at: authData.expires_at
          }
        };
      } catch (createErr) {
        console.error('Error in user creation:', createErr);
        // Use auth user data as fallback
        const tempUserData = {
          id: 'temp-' + Date.now(),
          auth_id: user.id,
          full_name: user.user_metadata?.full_name || user.email.split('@')[0],
          email: user.email
        };
        
        return { 
          success: true, 
          user: { ...user, ...tempUserData },
          session: {
            access_token: authData.access_token,
            refresh_token: authData.refresh_token,
            expires_at: authData.expires_at
          }
        };
      }
    }
    
    // Return user data
    return { 
      success: true, 
      user: { ...user, ...userData },
      session: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_at: authData.expires_at
      }
    };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get current user
export async function simpleGetCurrentUser() {
  try {
    // 1. First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { user: null };
    }
    
    if (!session) {
      console.log('No active session found');
      return { user: null };
    }
    
    // 2. Get user from session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting user from session:', error);
      return { user: null };
    }
    
    // 3. Get user data with fast timeout
    let userData = null;
    
    try {
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();
        
      if (!userError && userRecord) {
        userData = userRecord;
      } else {
        // Try to create user record if it doesn't exist
        try {
          // Create workspace
          const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .insert([{ name: 'My Workspace' }])
            .select()
            .single();
            
          if (!wsError && workspace) {
            // Create user
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                auth_id: user.id,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                email: user.email,
                workspace_id: workspace.id
              }])
              .select()
              .single();
              
            if (!createError && newUser) {
              // Update workspace with user ID
              await supabase
                .from('workspaces')
                .update({ created_by: newUser.id })
                .eq('id', workspace.id);
                
              // Create default channel
              await supabase
                .from('channels')
                .insert([{
                  workspace_id: workspace.id,
                  name: 'general',
                  description: 'General discussion',
                  created_by: newUser.id
                }]);
                
              userData = newUser;
            }
          }
        } catch (createErr) {
          console.error('Error creating user record:', createErr);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
    
    // 4. If we still don't have user data, return just the auth user with temporary ID
    if (!userData) {
      console.warn('Could not get or create user record, using auth user data');
      userData = {
        id: 'temp-' + Date.now(),
        auth_id: user.id,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email
      };
    }
    
    return { user: { ...user, ...userData } };
  } catch (err) {
    console.error('Error getting current user:', err);
    return { user: null };
  }
}

// Sign out
export async function simpleSignOut() {
  try {
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error('Error signing out:', err);
    return { success: false, error: 'Error signing out' };
  }
} 