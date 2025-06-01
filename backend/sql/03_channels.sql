-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(workspace_id, name)
);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select channels in their workspace
CREATE POLICY "select_channels" ON channels
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to insert channels in their workspace
CREATE POLICY "insert_channels" ON channels
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to update channels they created
CREATE POLICY "update_channels" ON channels
  FOR UPDATE USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Allow users to delete channels they created
CREATE POLICY "delete_channels" ON channels
  FOR DELETE USING (
    created_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Add constraint to limit channels per workspace (max 10)
CREATE OR REPLACE FUNCTION check_channel_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM channels WHERE workspace_id = NEW.workspace_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 channels per workspace allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_channel_limit
BEFORE INSERT ON channels
FOR EACH ROW
EXECUTE FUNCTION check_channel_limit();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_channels_workspace_id ON channels(workspace_id); 