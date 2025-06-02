-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON workspaces(created_by);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Create policies
-- These policies will be applied after users table is created
-- For now, we'll comment them out and add them later
/*
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
*/ 