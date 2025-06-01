-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  channel_id UUID NOT NULL REFERENCES channels(id),
  parent_message_id UUID REFERENCES messages(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select messages in their workspace
CREATE POLICY "select_messages" ON messages
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to insert messages in their workspace
CREATE POLICY "insert_messages" ON messages
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to update or delete their own messages
CREATE POLICY "modify_own_messages" ON messages
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_channel_created_at ON messages(channel_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_parent_created_at ON messages(parent_message_id, created_at) 
  WHERE parent_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_workspace_id ON messages(workspace_id); 