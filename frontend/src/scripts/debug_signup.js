import { supabase } from '../lib/supabase';

// Test function to debug signup issues
async function debugSignup() {
  const email = 'test@example.com';
  const password = 'password123';
  
  try {
    console.log('Starting signup debug test...');
    
    // 1. Direct signup with Supabase Auth
    console.log('1. Attempting direct signup with Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Test User',
          avatar_url: null
        }
      }
    });
    
    console.log('Auth response:', { authData, authError });
    
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    
    if (!authData.user) {
      console.error('No user returned from auth');
      return;
    }
    
    console.log('User created with ID:', authData.user.id);
    
    // 2. Wait for trigger to run
    console.log('2. Waiting for database trigger to run...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Check if user record was created
    console.log('3. Checking if user record was created in users table...');
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();
    
    console.log('User record query result:', { userRecord, userError });
    
    if (userError) {
      console.error('Error getting user record:', userError);
      return;
    }
    
    if (!userRecord) {
      console.error('No user record found - trigger may not have run');
      return;
    }
    
    console.log('User record created successfully:', userRecord);
    
    // 4. Check if workspace was created
    console.log('4. Checking if workspace was created...');
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', userRecord.workspace_id)
      .single();
    
    console.log('Workspace query result:', { workspace, workspaceError });
    
    // 5. Check if channel was created
    console.log('5. Checking if default channel was created...');
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', userRecord.workspace_id)
      .single();
    
    console.log('Channel query result:', { channel, channelError });
    
    console.log('Debug test complete!');
    
  } catch (error) {
    console.error('Unexpected error during debug test:', error);
  }
}

// Run the debug function
debugSignup(); 