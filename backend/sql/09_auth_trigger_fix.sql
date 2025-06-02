-- Fix for the auth trigger to handle user signup properly
-- This addresses the circular dependency between workspaces and users

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
  new_user_id UUID;
BEGIN
  -- Create a default workspace for the new user
  -- Initially set created_by to NULL to avoid the circular dependency
  INSERT INTO workspaces (name, created_by)
  VALUES ('Default Workspace', NULL)
  RETURNING id INTO new_workspace_id;
  
  -- Create a user record linked to the auth.user and the new workspace
  INSERT INTO users (auth_id, full_name, email, workspace_id, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), 
    NEW.email, 
    new_workspace_id,
    NEW.raw_user_meta_data->>'avatar_url'
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 