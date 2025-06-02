-- EMERGENCY FIX: Direct approach to ensure users are created properly
-- This script fixes permissions and simplifies the user creation process

-- 1. Make sure all required columns exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Drop the existing trigger that might be failing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create a simpler, more reliable trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  new_user_id UUID;
BEGIN
  -- Create workspace first (with NULL created_by)
  INSERT INTO public.workspaces (name, created_by)
  VALUES ('Default Workspace', NULL)
  RETURNING id INTO new_workspace_id;
  
  -- Create user record
  INSERT INTO public.users (
    auth_id, 
    full_name, 
    email, 
    workspace_id
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), 
    NEW.email, 
    new_workspace_id
  )
  RETURNING id INTO new_user_id;
  
  -- Update workspace with user ID
  UPDATE public.workspaces
  SET created_by = new_user_id
  WHERE id = new_workspace_id;
  
  -- Create default channel
  INSERT INTO public.channels (workspace_id, name, description, created_by)
  VALUES (new_workspace_id, 'general', 'General discussion', new_user_id);
  
  RETURN NEW;
END;
$$;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Fix permissions to ensure the trigger can access tables
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 6. Create a function to manually create a user record if needed
CREATE OR REPLACE FUNCTION public.create_user_manually(
  auth_user_id UUID,
  user_email TEXT,
  user_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  new_user_id UUID;
  full_name TEXT;
BEGIN
  -- Use provided name or extract from email
  full_name := COALESCE(user_name, split_part(user_email, '@', 1));
  
  -- Create workspace
  INSERT INTO public.workspaces (name, created_by)
  VALUES ('Default Workspace', NULL)
  RETURNING id INTO new_workspace_id;
  
  -- Create user
  INSERT INTO public.users (auth_id, full_name, email, workspace_id)
  VALUES (auth_user_id, full_name, user_email, new_workspace_id)
  RETURNING id INTO new_user_id;
  
  -- Update workspace
  UPDATE public.workspaces
  SET created_by = new_user_id
  WHERE id = new_workspace_id;
  
  -- Create channel
  INSERT INTO public.channels (workspace_id, name, description, created_by)
  VALUES (new_workspace_id, 'general', 'General discussion', new_user_id);
  
  RETURN new_user_id;
END;
$$; 