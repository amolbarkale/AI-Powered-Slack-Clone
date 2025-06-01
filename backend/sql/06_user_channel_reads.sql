-- Create user_channel_reads table
CREATE TABLE IF NOT EXISTS user_channel_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  user_id UUID NOT NULL REFERENCES users(id),
  channel_id UUID NOT NULL REFERENCES channels(id),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, channel_id)
);

-- Enable Row Level Security
ALTER TABLE user_channel_reads ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select their own read status
CREATE POLICY "select_reads" ON user_channel_reads
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to insert or update their own read status
CREATE POLICY "upsert_reads" ON user_channel_reads
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to update their own read status
CREATE POLICY "update_reads" ON user_channel_reads
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to delete their own read status
CREATE POLICY "delete_reads" ON user_channel_reads
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_channel_reads_user_id ON user_channel_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_channel_reads_channel_id ON user_channel_reads(channel_id);
CREATE INDEX IF NOT EXISTS idx_user_channel_reads_workspace_id ON user_channel_reads(workspace_id); 