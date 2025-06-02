// Test script to validate RLS policies
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Replace with your Supabase URL and anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
console.log('supabaseUrl:', supabaseUrl);
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
console.log('supabaseAnonKey:', supabaseAnonKey);

// Create Supabase client with anon key (public access)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Run tests
const runTests = async () => {
  console.log('Starting RLS policy tests...');
  
  try {
    // Test 1: Try to access data without authentication
    console.log('\nTest 1: Accessing data without authentication');
    
    // Try to get workspaces without being logged in
    console.log('Trying to get workspaces without authentication...');
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*');
    
    if (workspacesError) {
      console.log('Success! Access denied as expected:', workspacesError.message);
    } else {
      console.log(`Found ${workspaces?.length || 0} workspaces - this might indicate an RLS policy issue if you expected access to be denied`);
    }
    
    // Try to get users without being logged in
    console.log('Trying to get users without authentication...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.log('Success! Access denied as expected:', usersError.message);
    } else {
      console.log(`Found ${users?.length || 0} users - this might indicate an RLS policy issue if you expected access to be denied`);
    }
    
    // Try to get channels without being logged in
    console.log('Trying to get channels without authentication...');
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*');
    
    if (channelsError) {
      console.log('Success! Access denied as expected:', channelsError.message);
    } else {
      console.log(`Found ${channels?.length || 0} channels - this might indicate an RLS policy issue if you expected access to be denied`);
    }
    
    // Try to insert data without being logged in
    console.log('Trying to insert a message without authentication...');
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          workspace_id: '00000000-0000-0000-0000-000000000000', // Fake UUID
          channel_id: '00000000-0000-0000-0000-000000000000',   // Fake UUID
          user_id: '00000000-0000-0000-0000-000000000000',      // Fake UUID
          content: 'Test message'
        }
      ])
      .select();
    
    if (messageError) {
      console.log('Success! Insert denied as expected:', messageError.message);
    } else {
      console.log('Message inserted - this indicates an RLS policy issue');
    }
    
    console.log('\nRLS policy tests completed!');
    console.log('\nSummary:');
    console.log('- If access was denied for all operations without authentication, your RLS policies are working correctly.');
    console.log('- If any operations succeeded without authentication, you may need to review your RLS policies.');
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the tests
runTests().catch(error => {
  console.error('Unexpected error:', error);
}); 