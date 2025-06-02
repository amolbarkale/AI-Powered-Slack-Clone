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
              
            console.log('User record created immediately:', newUser);
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
    // 1. Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
    
    if (!data.user) {
      return { success: false, error: 'No user returned from authentication' };
    }
    
    // 2. Get user data with retry mechanism
    let userData = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!userData && attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts} to fetch user data`);
      
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', data.user.id)
        .single();
        
      if (!userError && userRecord) {
        userData = userRecord;
        break;
      }
      
      if (attempts < maxAttempts) {
        console.log('User record not found, creating manually...');
        
        // Create user record if it doesn't exist
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
                auth_id: data.user.id,
                full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                email: data.user.email,
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
              break;
            }
          }
        } catch (err) {
          console.error('Error creating user record:', err);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // 3. If we still don't have user data, return just the auth user
    if (!userData) {
      console.warn('Could not get or create user record, using auth user data');
      userData = {
        id: 'temp-' + Date.now(),
        auth_id: data.user.id,
        full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        email: data.user.email
      };
    }
    
    console.log('Sign in successful with user data:', userData);
    
    return { 
      success: true, 
      user: { ...data.user, ...userData },
      session: data.session
    };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get current user
export async function simpleGetCurrentUser() {
  try {
    // 1. Get session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { user: null };
    }
    
    // 2. Get user data with fast timeout
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
    
    // 3. If we still don't have user data, return just the auth user with temporary ID
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