import { supabase } from './supabase';

/**
 * Authentication Functions
 */

export async function signUp(email, password, userData = {}) {
  try {
    console.log('Signing up with:', { email, password, userData });
    
    // 1. Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName || email.split('@')[0],
          avatar_url: userData.avatarUrl || null
        }
      }
    });

    console.log('Auth response:', { authData, authError });
    
    if (authError) throw authError;
    
    // Return success immediately - the database trigger will handle creating the user record
    // We won't try to update additional fields yet as it might fail due to timing issues
    return { data: authData, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    console.log('Getting current user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in getCurrentUser:', authError);
      return { data: { user: null }, error: authError };
    }
    
    if (user) {
      console.log('Auth user found:', user.id);
      try {
        // Get additional user data from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();
        
        // If user record exists, return it
        if (!userError && userData) {
          console.log('User record found in database');
          return { data: { user: { ...user, ...userData } }, error: null };
        }
        
        // If user record doesn't exist but we have an auth user, create it
        console.log('User record not found, attempting to create manually...');
        
        try {
          // Try to use the RPC function if it exists
          const { data: newUserId, error: rpcError } = await supabase.rpc(
            'create_user_manually',
            { 
              auth_user_id: user.id,
              user_email: user.email,
              user_name: user.user_metadata?.full_name || null
            }
          );
          
          if (!rpcError && newUserId) {
            console.log('User created via RPC function:', newUserId);
            
            // Get the newly created user
            const { data: newUser, error: fetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', newUserId)
              .single();
              
            if (!fetchError && newUser) {
              return { data: { user: { ...user, ...newUser } }, error: null };
            }
          } else {
            console.error('RPC error:', rpcError);
            
            // Fallback to direct creation
            return await createUserManually(user);
          }
        } catch (rpcError) {
          console.error('Error calling RPC function:', rpcError);
          
          // Fallback to direct creation
          return await createUserManually(user);
        }
        
        // If we get here, return just the auth user
        console.log('Returning just auth user as fallback');
        return { data: { user }, error: null };
      } catch (userDataError) {
        console.error('Error fetching user data:', userDataError);
        return { data: { user }, error: null };
      }
    }
    
    return { data: { user: null }, error: null };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { data: { user: null }, error };
  }
}

// Helper function to manually create a user record
async function createUserManually(authUser) {
  console.log('Creating user manually via direct DB operations');
  
  try {
    // 1. Create workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert([{ name: 'Default Workspace' }])
      .select()
      .single();
      
    if (wsError) {
      console.error('Error creating workspace:', wsError);
      return { data: { user: authUser }, error: null };
    }
    
    // 2. Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        auth_id: authUser.id,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        email: authUser.email,
        workspace_id: workspace.id
      }])
      .select()
      .single();
      
    if (userError) {
      console.error('Error creating user:', userError);
      return { data: { user: authUser }, error: null };
    }
    
    // 3. Update workspace
    await supabase
      .from('workspaces')
      .update({ created_by: newUser.id })
      .eq('id', workspace.id);
      
    // 4. Create channel
    await supabase
      .from('channels')
      .insert([{
        workspace_id: workspace.id,
        name: 'general',
        description: 'General discussion',
        created_by: newUser.id
      }]);
      
    console.log('User created manually successfully');
    return { data: { user: { ...authUser, ...newUser } }, error: null };
  } catch (error) {
    console.error('Error in manual user creation:', error);
    return { data: { user: authUser }, error: null };
  }
}

/**
 * Workspace Functions
 */

export async function getWorkspaces() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Get workspaces where user is owner or member
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .or(`created_by.eq.${user.id},members.cs.{${user.id}}`);
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting workspaces:', error);
    return { data: [], error };
  }
}

export async function createWorkspace(name, description = '') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Create the workspace
    const { data, error } = await supabase
      .from('workspaces')
      .insert([{
        name,
        description,
        slug,
        created_by: user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Create default general channel
    await createChannel(data.id, 'general', 'Company-wide announcements and work-based matters');
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating workspace:', error);
    return { data: null, error };
  }
}

/**
 * Channel Functions
 */

export async function getChannels(workspaceId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting channels:', error);
    return { data: [], error };
  }
}

export async function createChannel(workspaceId, name, description = '', isPrivate = false) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('channels')
      .insert([{
        workspace_id: workspaceId,
        name,
        description,
        is_private: isPrivate,
        created_by: user.id
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error creating channel:', error);
    return { data: null, error };
  }
}

/**
 * Message Functions
 */

export async function getMessages(channelId, limit = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Get messages for the channel, excluding thread replies
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:user_id(id, full_name, avatar_url),
        attachments(*)
      `)
      .eq('channel_id', channelId)
      .is('parent_message_id', null) // Only get top-level messages
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Mark channel as read
    await markChannelAsRead(channelId);
    
    return { data: data.reverse(), error: null }; // Reverse to get oldest first
  } catch (error) {
    console.error('Error getting messages:', error);
    return { data: [], error };
  }
}

export async function getThreadMessages(parentMessageId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Get the parent message first
    const { data: parentMessage, error: parentError } = await supabase
      .from('messages')
      .select(`
        *,
        user:user_id(id, full_name, avatar_url),
        attachments(*)
      `)
      .eq('id', parentMessageId)
      .single();
    
    if (parentError) throw parentError;
    
    // Get all replies to this message
    const { data: replies, error: repliesError } = await supabase
      .from('messages')
      .select(`
        *,
        user:user_id(id, full_name, avatar_url),
        attachments(*)
      `)
      .eq('parent_message_id', parentMessageId)
      .order('created_at', { ascending: true });
    
    if (repliesError) throw repliesError;
    
    // Combine parent and replies
    const threadMessages = [parentMessage, ...replies];
    
    return { data: threadMessages, error: null };
  } catch (error) {
    console.error('Error getting thread messages:', error);
    return { data: [], error };
  }
}

export async function sendMessage(channelId, content, parentMessageId = null, workspaceId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Create the message
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        channel_id: channelId,
        workspace_id: workspaceId,
        user_id: user.id,
        content,
        parent_message_id: parentMessageId
      }])
      .select(`
        *,
        user:user_id(id, full_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
}

export async function editMessage(messageId, content) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('messages')
      .update({ content, edited_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('user_id', user.id) // Ensure user can only edit their own messages
      .select(`
        *,
        user:user_id(id, full_name, avatar_url)
      `)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error editing message:', error);
    return { data: null, error };
  }
}

export async function deleteMessage(messageId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Delete the message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id); // Ensure user can only delete their own messages
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { error };
  }
}

/**
 * File Attachment Functions
 */

export async function uploadFile(file, channelId, messageId = null, workspaceId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // 1. Upload file to storage
    const filePath = `${workspaceId}/${channelId}/${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase
      .storage
      .from('attachments-bucket')
      .upload(filePath, file);
    
    if (storageError) throw storageError;
    
    // 2. Create a public URL for the file
    const { data: urlData } = await supabase
      .storage
      .from('attachments-bucket')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry
    
    // 3. Create attachment record
    const { data: attachmentData, error: attachmentError } = await supabase
      .from('attachments')
      .insert([{
        workspace_id: workspaceId,
        channel_id: channelId,
        message_id: messageId,
        storage_path: filePath,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id
      }])
      .select()
      .single();
    
    if (attachmentError) throw attachmentError;
    
    return {
      data: {
        ...attachmentData,
        url: urlData.signedUrl
      },
      error: null
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { data: null, error };
  }
}

export async function sendMessageWithAttachment(channelId, content, file, parentMessageId = null, workspaceId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // 1. Create the message first
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([{
        channel_id: channelId,
        workspace_id: workspaceId,
        user_id: user.id,
        content,
        parent_message_id: parentMessageId
      }])
      .select()
      .single();
    
    if (messageError) throw messageError;
    
    // 2. Upload the file and create attachment linked to the message
    const { error: attachmentError } = await uploadFile(
      file,
      channelId,
      messageData.id,
      workspaceId
    );
    
    if (attachmentError) throw attachmentError;
    
    // 3. Get the complete message with user and attachment data
    const { data: fullMessage, error: fullMessageError } = await supabase
      .from('messages')
      .select(`
        *,
        user:user_id(id, full_name, avatar_url),
        attachments(*)
      `)
      .eq('id', messageData.id)
      .single();
    
    if (fullMessageError) throw fullMessageError;
    
    return { data: fullMessage, error: null };
  } catch (error) {
    console.error('Error sending message with attachment:', error);
    return { data: null, error };
  }
}

/**
 * Read Status Functions
 */

export async function markChannelAsRead(channelId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    // Get workspace ID for the channel
    const { data: channelData, error: channelError } = await supabase
      .from('channels')
      .select('workspace_id')
      .eq('id', channelId)
      .single();
    
    if (channelError) throw channelError;
    
    // Upsert (insert or update) the read status
    const { error } = await supabase
      .from('user_channel_reads')
      .upsert({
        user_id: user.id,
        channel_id: channelId,
        workspace_id: channelData.workspace_id,
        last_read_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error('Error marking channel as read:', error);
    return { error };
  }
}

export async function getUnreadCounts(userId) {
  try {
    // Call the custom RPC function to get unread counts
    const { data, error } = await supabase.rpc('get_unread_counts', {
      p_user_id: userId
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting unread counts:', error);
    return { data: [], error };
  }
}

/**
 * User Functions
 */

export async function updateUserProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

export async function getChannelMembers(channelId) {
  try {
    // Get users who have sent messages in this channel
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .in('id', (query) => {
        query
          .select('user_id')
          .from('messages')
          .eq('channel_id', channelId)
          .distinct();
      });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error getting channel members:', error);
    return { data: [], error };
  }
}

/**
 * Realtime Subscriptions
 */

export function subscribeToMessages(channelId, callback) {
  return supabase
    .channel(`messages:${channelId}`)
    .on('postgres_changes', {
      event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public',
      table: 'messages',
      filter: `channel_id=eq.${channelId}`
    }, (payload) => {
      callback(payload);
    })
    .subscribe();
}

export function subscribeToThreadMessages(parentMessageId, callback) {
  return supabase
    .channel(`thread:${parentMessageId}`)
    .on('postgres_changes', {
      event: '*', // Listen to all events
      schema: 'public',
      table: 'messages',
      filter: `parent_message_id=eq.${parentMessageId}`
    }, (payload) => {
      callback(payload);
    })
    .subscribe();
}

export function subscribeToChannels(workspaceId, callback) {
  return supabase
    .channel(`channels:${workspaceId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'channels',
      filter: `workspace_id=eq.${workspaceId}`
    }, (payload) => {
      callback(payload);
    })
    .subscribe();
}

export function subscribeToUserStatus(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
} 