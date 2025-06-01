-- This script configures the storage bucket for attachments
-- Note: Some of these operations need to be done via the Supabase dashboard
-- This file serves as documentation for those operations

-- 1. Create a private bucket for attachments
-- In the Supabase dashboard: Storage > New Bucket
-- Name: attachments-bucket
-- Public bucket: No (unchecked)
-- File size limit: 10485760 (10MB)

-- 2. Create RLS policies for the bucket
-- In SQL Editor, run:

-- Allow users to select their workspace's files
CREATE POLICY "select_workspace_files"
ON storage.objects FOR SELECT
USING (
  -- Extract workspace_id from the path (format: workspaces/{workspace_id}/...)
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM users WHERE auth_id = auth.uid()
  )
);

-- Allow users to insert files into their workspace
CREATE POLICY "insert_workspace_files"
ON storage.objects FOR INSERT
WITH CHECK (
  -- Extract workspace_id from the path (format: workspaces/{workspace_id}/...)
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM users WHERE auth_id = auth.uid()
  )
);

-- Allow users to update their own files
CREATE POLICY "update_own_files"
ON storage.objects FOR UPDATE
USING (
  auth.uid()::text = (storage.foldername(name))[3]
);

-- Allow users to delete their own files
CREATE POLICY "delete_own_files"
ON storage.objects FOR DELETE
USING (
  auth.uid()::text = (storage.foldername(name))[3]
);

-- 3. Set URL expiration time for signed URLs
-- This is done in the Supabase dashboard: Storage > Settings
-- Default expiration time: 60 seconds 