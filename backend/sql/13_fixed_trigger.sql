-- Enhanced auth trigger with better debugging and reliability
-- This trigger runs when a new user is created in auth.users

-- Create a log table for debugging
CREATE TABLE IF NOT EXISTS auth_trigger_logs (
  id SERIAL PRIMARY KEY,
  event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  step TEXT,
  message TEXT,
  error TEXT
);

-- Create a function to log events
CREATE OR REPLACE FUNCTION log_auth_event(
  p_user_id UUID,
  p_step TEXT,
  p_message TEXT,
  p_error TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO auth_trigger_logs (user_id, step, message, error)
  VALUES (p_user_id, p_step, p_message, p_error);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improved trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
  new_user_id UUID;
  user_full_name TEXT;
  user_avatar_url TEXT;
  user_bio TEXT;
  user_phone TEXT;
BEGIN
  -- Log trigger start
  PERFORM log_auth_event(NEW.id, 'START', 'Auth trigger started');
  
  -- Extract user metadata
  BEGIN
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');
    user_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    user_bio := NEW.raw_user_meta_data->>'bio';
    user_phone := NEW.raw_user_meta_data->>'phone';
    
    PERFORM log_auth_event(NEW.id, 'METADATA', format('Extracted metadata: name=%s', user_full_name));
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_auth_event(NEW.id, 'METADATA_ERROR', 'Error extracting metadata', SQLERRM);
    user_full_name := 'New User';
  END;

  -- Create a default workspace
  BEGIN
    INSERT INTO workspaces (name, created_by)
    VALUES ('Default Workspace', NULL)
    RETURNING id INTO new_workspace_id;
    
    PERFORM log_auth_event(NEW.id, 'WORKSPACE', format('Created workspace with ID: %s', new_workspace_id));
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_auth_event(NEW.id, 'WORKSPACE_ERROR', 'Error creating workspace', SQLERRM);
    RAISE;
  END;
  
  -- Create a user record
  BEGIN
    INSERT INTO users (
      auth_id, 
      full_name, 
      email, 
      workspace_id, 
      avatar_url,
      bio,
      phone
    )
    VALUES (
      NEW.id, 
      user_full_name,
      NEW.email, 
      new_workspace_id,
      user_avatar_url,
      user_bio,
      user_phone
    )
    RETURNING id INTO new_user_id;
    
    PERFORM log_auth_event(NEW.id, 'USER', format('Created user with ID: %s', new_user_id));
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_auth_event(NEW.id, 'USER_ERROR', 'Error creating user', SQLERRM);
    RAISE;
  END;
  
  -- Update workspace with user ID
  BEGIN
    UPDATE workspaces
    SET created_by = new_user_id
    WHERE id = new_workspace_id;
    
    PERFORM log_auth_event(NEW.id, 'WORKSPACE_UPDATE', 'Updated workspace with user ID');
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_auth_event(NEW.id, 'WORKSPACE_UPDATE_ERROR', 'Error updating workspace', SQLERRM);
    -- Continue even if this fails
  END;
  
  -- Create a default channel
  BEGIN
    INSERT INTO channels (workspace_id, name, description, created_by)
    VALUES (new_workspace_id, 'general', 'General discussion', new_user_id);
    
    PERFORM log_auth_event(NEW.id, 'CHANNEL', 'Created default channel');
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_auth_event(NEW.id, 'CHANNEL_ERROR', 'Error creating channel', SQLERRM);
    -- Continue even if this fails
  END;
  
  -- Log successful completion
  PERFORM log_auth_event(NEW.id, 'COMPLETE', 'Auth trigger completed successfully');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM log_auth_event(NEW.id, 'FATAL_ERROR', 'Fatal error in trigger', SQLERRM);
    RETURN NEW; -- Still return NEW to allow the auth user to be created
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to view trigger logs
CREATE OR REPLACE FUNCTION view_auth_logs(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  id INTEGER,
  event_time TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  step TEXT,
  message TEXT,
  error TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.event_time, l.user_id, l.step, l.message, l.error
  FROM auth_trigger_logs l
  ORDER BY l.event_time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 