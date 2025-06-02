-- Comprehensive fix for the signup process
-- This combines all the necessary fixes into one SQL file

-- 1. Fix the workspaces table to allow NULL for created_by
ALTER TABLE workspaces ALTER COLUMN created_by DROP NOT NULL;

-- 2. Add bio and phone columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Add avatar_url column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 4. Fix the auth trigger to handle the signup process correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
  new_user_id UUID;
  user_full_name TEXT;
  user_avatar_url TEXT;
BEGIN
  -- Extract user metadata
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');
  user_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  -- Create a default workspace for the new user with NULL created_by initially
  INSERT INTO workspaces (name, created_by)
  VALUES ('Default Workspace', NULL)
  RETURNING id INTO new_workspace_id;
  
  -- Create a user record linked to the auth.user and the new workspace
  INSERT INTO users (
    auth_id, 
    full_name, 
    email, 
    workspace_id, 
    avatar_url
  )
  VALUES (
    NEW.id, 
    user_full_name,
    NEW.email, 
    new_workspace_id,
    user_avatar_url
  )
  RETURNING id INTO new_user_id;
  
  -- Update the workspace with the proper user ID (now that we have it)
  UPDATE workspaces
  SET created_by = new_user_id
  WHERE id = new_workspace_id;
  
  -- Create a default "general" channel in the workspace
  INSERT INTO channels (workspace_id, name, description, created_by)
  VALUES (new_workspace_id, 'general', 'General discussion', new_user_id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in the Supabase logs)
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW; -- Still return NEW to allow the auth user to be created
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 