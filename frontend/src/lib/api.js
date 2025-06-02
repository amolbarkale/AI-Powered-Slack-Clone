import supabase from './supabaseClient';

// Error handler wrapper
const handleError = (error) => {
  console.error('API Error:', error);
  return { error, data: null };
};

// Authentication helpers
export const signUp = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return handleError(error);
    return { error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Workspace helpers
export const getWorkspaces = async () => {
  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*');
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Channel helpers
export const getChannels = async (workspaceId) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId);
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const createChannel = async (workspaceId, name, description = '') => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .insert([
        { 
          workspace_id: workspaceId, 
          name, 
          description 
        }
      ])
      .select();
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// Message helpers
export const getMessages = async (channelId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users (id, full_name, avatar_url),
        attachments (*)
      `)
      .eq('channel_id', channelId)
      .is('parent_message_id', null) // Only get top-level messages
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const sendMessage = async (workspaceId, channelId, userId, content, parentMessageId = null) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          workspace_id: workspaceId,
          channel_id: channelId,
          user_id: userId,
          content,
          parent_message_id: parentMessageId
        }
      ])
      .select();
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const getThreadReplies = async (parentMessageId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        users (id, full_name, avatar_url),
        attachments (*)
      `)
      .eq('parent_message_id', parentMessageId)
      .order('created_at', { ascending: true });
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// User channel read status
export const markChannelAsRead = async (workspaceId, userId, channelId) => {
  try {
    const { data, error } = await supabase
      .from('user_channel_reads')
      .upsert([
        {
          workspace_id: workspaceId,
          user_id: userId,
          channel_id: channelId,
          last_read_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const getUnreadCounts = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_unread_count', { p_user_id: userId });
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
};

// File upload helpers
export const uploadAttachment = async (workspaceId, channelId, messageId, file) => {
  try {
    // First upload file to storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${workspaceId}/${channelId}/${messageId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('attachments-bucket')
      .upload(filePath, file);
    
    if (uploadError) return handleError(uploadError);
    
    // Then create attachment record in database
    const { data: attachmentData, error: attachmentError } = await supabase
      .from('attachments')
      .insert([
        {
          workspace_id: workspaceId,
          channel_id: channelId,
          message_id: messageId,
          storage_path: filePath,
          filename: file.name
        }
      ])
      .select();
    
    if (attachmentError) return handleError(attachmentError);
    return { data: attachmentData, error: null };
  } catch (error) {
    return handleError(error);
  }
};

export const getAttachmentUrl = async (storagePath) => {
  try {
    const { data, error } = await supabase.storage
      .from('attachments-bucket')
      .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry
    
    if (error) return handleError(error);
    return { data, error: null };
  } catch (error) {
    return handleError(error);
  }
}; 