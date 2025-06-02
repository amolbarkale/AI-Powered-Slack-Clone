import { createContext, useContext, useState, useEffect } from 'react';
import { useWorkspace } from './WorkspaceContext';

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
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock channels for demo
  const mockChannels = [
    {
      id: 'channel-1',
      name: 'general',
      description: 'Company-wide announcements and work-based matters',
      workspace_id: currentWorkspace?.id,
      is_private: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'channel-2',
      name: 'random',
      description: 'Non-work banter and water cooler conversation',
      workspace_id: currentWorkspace?.id,
      is_private: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'channel-3',
      name: 'development',
      description: 'Development team discussions',
      workspace_id: currentWorkspace?.id,
      is_private: false,
      created_at: new Date().toISOString(),
    },
  ];

  // Fetch channels when workspace changes
  useEffect(() => {
    const fetchChannels = async () => {
      if (!currentWorkspace) {
        setChannels([]);
        setCurrentChannel(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // In a real app, fetch from Supabase
        // const { data, error } = await supabase
        //   .from('channels')
        //   .select('*')
        //   .eq('workspace_id', currentWorkspace.id);
        
        // if (error) throw error;
        
        // For demo purposes, use mock data
        const data = mockChannels;
        
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
  }, [currentWorkspace, currentChannel]);

  // Mock unread counts for demo
  useEffect(() => {
    if (!channels.length) return;
    
    // Generate random unread counts for demo
    const mockUnreadCounts = {};
    channels.forEach(channel => {
      mockUnreadCounts[channel.id] = Math.floor(Math.random() * 5); // 0-4 unread messages
    });
    
    setUnreadCounts(mockUnreadCounts);
  }, [channels]);

  const createChannel = async (channelData) => {
    try {
      setError(null);
      
      // In a real app, insert to Supabase
      // const { data, error } = await supabase
      //   .from('channels')
      //   .insert([{ ...channelData, workspace_id: currentWorkspace.id }])
      //   .select()
      //   .single();
      
      // if (error) throw error;
      
      // For demo purposes, create mock data
      const newChannel = {
        id: `channel-${channels.length + 1}`,
        name: channelData.name,
        description: channelData.description || '',
        workspace_id: currentWorkspace?.id,
        is_private: channelData.is_private || false,
        created_at: new Date().toISOString(),
      };
      
      setChannels([...channels, newChannel]);
      return { data: newChannel, error: null };
    } catch (err) {
      console.error('Error creating channel:', err);
      setError(err.message);
      return { data: null, error: err };
    }
  };

  const switchChannel = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setCurrentChannel(channel);
      
      // Clear unread count for this channel
      if (unreadCounts[channelId]) {
        setUnreadCounts(prev => ({
          ...prev,
          [channelId]: 0
        }));
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