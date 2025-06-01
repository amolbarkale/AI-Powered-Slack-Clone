-- Create function to get unread count for a channel
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID, p_channel_id UUID)
RETURNS TABLE (unread_count BIGINT) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_read_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the last time the user read this channel
  SELECT last_read_at INTO v_last_read_at
  FROM user_channel_reads
  WHERE user_id = p_user_id AND channel_id = p_channel_id;
  
  -- If no read record exists, count all messages
  IF v_last_read_at IS NULL THEN
    RETURN QUERY
      SELECT COUNT(*)::BIGINT AS unread_count
      FROM messages
      WHERE channel_id = p_channel_id AND parent_message_id IS NULL;
  ELSE
    -- Count messages newer than last read time
    RETURN QUERY
      SELECT COUNT(*)::BIGINT AS unread_count
      FROM messages
      WHERE channel_id = p_channel_id
        AND created_at > v_last_read_at
        AND parent_message_id IS NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_count(UUID, UUID) TO authenticated;

-- Test query example (commented out):
-- SELECT * FROM get_unread_count('user-uuid', 'channel-uuid'); 