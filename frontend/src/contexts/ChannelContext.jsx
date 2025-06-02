import { createContext, useContext, useState, useEffect } from 'react';
import { useWorkspace } from './WorkspaceContext';
import { useAuth } from './AuthContext';
import { getChannels, createChannel as apiCreateChannel, markChannelAsRead, getUnreadCounts, subscribeToChannels } from '../lib/api';

const ChannelContext = createContext();

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
};

export const ChannelProvider = ({ children }) => {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch channels when workspace changes
  useEffect(() => {
    const fetchChannels = async () => {
      if (!currentWorkspace || !user) {
        setChannels([]);
        setCurrentChannel(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: apiError } = await getChannels(currentWorkspace.id);
        
        if (apiError) throw apiError;
        
        setChannels(data);
        
        // Set the first channel as current if none is selected
        if (data.length > 0 && !currentChannel) {
          setCurrentChannel(data[0]);
        }
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
    
    // Subscribe to channel changes
    let subscription;
    if (currentWorkspace) {
      subscription = subscribeToChannels(currentWorkspace.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          setChannels(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setChannels(prev => prev.map(channel => 
            channel.id === payload.new.id ? payload.new : channel
          ));
        } else if (payload.eventType === 'DELETE') {
          setChannels(prev => prev.filter(channel => channel.id !== payload.old.id));
        }
      });
    }
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [currentWorkspace, user]);

  // Update current channel when channels change and current channel is no longer in the list
  useEffect(() => {
    if (currentChannel && !channels.some(c => c.id === currentChannel.id)) {
      if (channels.length > 0) {
        setCurrentChannel(channels[0]);
      } else {
        setCurrentChannel(null);
      }
    }
  }, [channels, currentChannel]);

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!user || !channels.length) return;
      
      try {
        const { data, error: apiError } = await getUnreadCounts(user.id);
        
        if (apiError) throw apiError;
        
        // Convert array of unread counts to object
        const countsObj = {};
        data.forEach(item => {
          countsObj[item.channel_id] = item.unread_count;
        });
        
        setUnreadCounts(countsObj);
      } catch (err) {
        console.error('Error fetching unread counts:', err);
      }
    };
    
    fetchUnreadCounts();
    
    // Set up interval to refresh unread counts
    const interval = setInterval(fetchUnreadCounts, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [channels, user]);

  const createChannel = async (channelData) => {
    try {
      if (!currentWorkspace) {
        throw new Error('No workspace selected');
      }
      
      setError(null);
      
      const { data, error: apiError } = await apiCreateChannel(
        currentWorkspace.id,
        channelData.name,
        channelData.description || '',
        channelData.is_private || false
      );
      
      if (apiError) throw apiError;
      
      setChannels(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating channel:', err);
      setError(err.message);
      return { data: null, error: err };
    }
  };

  const switchChannel = async (channelId) => {
    const channel = channels?.find(c => c.id === channelId);
    if (channel) {
      setCurrentChannel(channel);
      
      // Mark channel as read
      if (user) {
        try {
          await markChannelAsRead(channelId);
          
          // Clear unread count for this channel
          setUnreadCounts(prev => ({
            ...prev,
            [channelId]: 0
          }));
        } catch (err) {
          console.error('Error marking channel as read:', err);
        }
      }
    }
  };

  return (
    <ChannelContext.Provider 
      value={{ 
        channels, 
        currentChannel, 
        switchChannel, 
        unreadCounts,
        loading, 
        error,
        createChannel
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}; 