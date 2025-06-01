-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(auth_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select themselves
CREATE POLICY "select_self_user" ON users
  FOR SELECT USING (
    auth_id = auth.uid()
  );

-- Allow users to select other users in the same workspace
CREATE POLICY "select_workspace_users" ON users
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to insert their own record (typically during signup)
CREATE POLICY "insert_user" ON users
  FOR INSERT WITH CHECK (
    auth_id = auth.uid()
  );

-- Allow users to update their own record
CREATE POLICY "update_self_user" ON users
  FOR UPDATE USING (
    auth_id = auth.uid()
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON users(workspace_id); 