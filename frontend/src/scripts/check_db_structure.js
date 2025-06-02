import { supabase } from '../lib/supabase';

// Function to check database structure
async function checkDatabaseStructure() {
  try {
    console.log('Checking database structure...');
    
    // Check workspaces table structure
    console.log('\nChecking workspaces table structure:');
    const { data: workspacesColumns, error: workspacesError } = await supabase.rpc('get_table_columns', { 
      p_table_name: 'workspaces' 
    });
    
    if (workspacesError) {
      console.error('Error getting workspaces table structure:', workspacesError);
    } else {
      console.log('Workspaces table columns:', workspacesColumns);
    }
    
    // Check users table structure
    console.log('\nChecking users table structure:');
    const { data: usersColumns, error: usersError } = await supabase.rpc('get_table_columns', { 
      p_table_name: 'users' 
    });
    
    if (usersError) {
      console.error('Error getting users table structure:', usersError);
    } else {
      console.log('Users table columns:', usersColumns);
    }
    
    // Check channels table structure
    console.log('\nChecking channels table structure:');
    const { data: channelsColumns, error: channelsError } = await supabase.rpc('get_table_columns', { 
      p_table_name: 'channels' 
    });
    
    if (channelsError) {
      console.error('Error getting channels table structure:', channelsError);
    } else {
      console.log('Channels table columns:', channelsColumns);
    }
    
    // Check auth triggers
    console.log('\nChecking auth triggers:');
    const { data: triggers, error: triggersError } = await supabase.rpc('get_triggers', { 
      p_table_name: 'users',
      p_schema_name: 'auth'
    });
    
    if (triggersError) {
      console.error('Error getting auth triggers:', triggersError);
    } else {
      console.log('Auth triggers:', triggers);
    }
    
  } catch (error) {
    console.error('Unexpected error during database structure check:', error);
  }
}

// Create RPC functions if they don't exist
async function createRpcFunctions() {
  try {
    console.log('Creating RPC functions for database inspection...');
    
    // Function to get table columns
    const createGetTableColumnsRpc = `
      CREATE OR REPLACE FUNCTION get_table_columns(p_table_name TEXT)
      RETURNS TABLE (
        column_name TEXT,
        data_type TEXT,
        is_nullable TEXT
      ) LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        RETURN QUERY
        SELECT c.column_name::TEXT, c.data_type::TEXT, c.is_nullable::TEXT
        FROM information_schema.columns c
        WHERE c.table_name = p_table_name
        AND c.table_schema = 'public';
      END;
      $$;
    `;
    
    // Function to get triggers
    const createGetTriggersRpc = `
      CREATE OR REPLACE FUNCTION get_triggers(p_table_name TEXT, p_schema_name TEXT DEFAULT 'public')
      RETURNS TABLE (
        trigger_name TEXT,
        event_manipulation TEXT,
        action_statement TEXT
      ) LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        RETURN QUERY
        SELECT t.trigger_name::TEXT, t.event_manipulation::TEXT, t.action_statement::TEXT
        FROM information_schema.triggers t
        WHERE t.event_object_table = p_table_name
        AND t.event_object_schema = p_schema_name;
      END;
      $$;
    `;
    
    // Create the functions
    await supabase.rpc('exec_sql', { sql: createGetTableColumnsRpc });
    await supabase.rpc('exec_sql', { sql: createGetTriggersRpc });
    
    console.log('RPC functions created successfully!');
    
  } catch (error) {
    console.error('Error creating RPC functions:', error);
  }
}

// Create another RPC function to execute SQL
async function createExecSqlRpc() {
  try {
    console.log('Creating exec_sql RPC function...');
    
    const sql = `
      CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
      RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error creating exec_sql function:', error);
      
      // Try direct SQL execution
      console.log('Attempting direct SQL execution...');
      const { error: directError } = await supabase.from('_rpc').select('*').eq('name', 'exec_sql');
      
      if (directError) {
        console.error('Direct SQL execution failed:', directError);
      }
    } else {
      console.log('exec_sql function created successfully!');
    }
    
  } catch (error) {
    console.error('Unexpected error creating exec_sql function:', error);
  }
}

// Run the functions
async function run() {
  try {
    // First create the exec_sql function
    await createExecSqlRpc();
    
    // Then create the other RPC functions
    await createRpcFunctions();
    
    // Finally check the database structure
    await checkDatabaseStructure();
    
  } catch (error) {
    console.error('Error running database structure check:', error);
  }
}

run(); 