-- ULTRA SIMPLE FIX: Bare minimum to make user signup work
-- This script removes complexity and focuses on the core functionality

-- 1. First, disable the trigger that might be causing problems
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Make sure the users table has the necessary columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Create a simple function for manual user creation
CREATE OR REPLACE FUNCTION public.create_user_record(
  user_id UUID, 
  user_email TEXT,
  user_name TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
  ws_id UUID;
  u_id UUID;
BEGIN
  -- Create workspace
  INSERT INTO workspaces (name)
  VALUES ('My Workspace')
  RETURNING id INTO ws_id;
  
  -- Create user
  INSERT INTO users (auth_id, email, full_name, workspace_id)
  VALUES (user_id, user_email, COALESCE(user_name, user_email), ws_id)
  RETURNING id INTO u_id;
  
  -- Update workspace
  UPDATE workspaces SET created_by = u_id WHERE id = ws_id;
  
  -- Create channel
  INSERT INTO channels (name, workspace_id, created_by, description)
  VALUES ('general', ws_id, u_id, 'General channel');
END;
$$ LANGUAGE plpgsql;

-- 4. Grant permissions
ALTER FUNCTION public.create_user_record(UUID, TEXT, TEXT) SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.create_user_record TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_record TO anon;
GRANT EXECUTE ON FUNCTION public.create_user_record TO service_role;

-- 5. Create a function to check if a user exists and create if not
CREATE OR REPLACE FUNCTION public.ensure_user_exists(
  user_id UUID, 
  user_email TEXT,
  user_name TEXT DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM users WHERE auth_id = user_id) INTO user_exists;
  
  -- If not, create user
  IF NOT user_exists THEN
    PERFORM create_user_record(user_id, user_email, user_name);
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 