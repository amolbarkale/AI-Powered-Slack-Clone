-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  channel_id UUID NOT NULL REFERENCES channels(id),
  message_id UUID NOT NULL REFERENCES messages(id),
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Check that only PDF and TXT files are allowed
  CHECK (filename ILIKE '%.pdf' OR filename ILIKE '%.txt')
);

-- Enable Row Level Security
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select attachments in their workspace
CREATE POLICY "select_attachments" ON attachments
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to insert attachments in their workspace
CREATE POLICY "insert_attachments" ON attachments
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to delete their own attachments
CREATE POLICY "delete_attachments" ON attachments
  FOR DELETE USING (
    uploaded_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Add trigger to enforce 10MB file size limit
-- Note: This would be enforced in application code since we can't check file size at DB level
-- This is a placeholder for documentation purposes

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_attachments_workspace_id ON attachments(workspace_id); 