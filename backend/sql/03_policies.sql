-- This file contains policies that require both workspaces and users tables to exist

-- Workspaces policies
-- Allow users to select workspaces they belong to
CREATE POLICY "select_workspace" ON workspaces
  FOR SELECT USING (
    id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to insert workspaces (typically only during signup)
CREATE POLICY "insert_workspace" ON workspaces
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  ); 