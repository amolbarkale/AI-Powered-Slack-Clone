import { createContext, useContext, useState, useEffect } from 'react';
import { getChannels, getUnreadCounts } from '../lib/api';
import { useWorkspace } from './WorkspaceContext';
import { useAuth } from './AuthContext';

const ChannelContext = createContext(null);

export const ChannelProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const { data, error } = await getChannels(currentWorkspace.id);
        
        if (error) {
          setError(error.message);
        } else {
          setChannels(data);
          
          // Set the first channel as current if none is selected
          if (data.length > 0 && !currentChannel) {
            setCurrentChannel(data[0]);
          }
        }
      } catch (error) {
        console.error('Channel error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [currentWorkspace, currentChannel]);

  // Fetch unread counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!user || !currentWorkspace) return;

      try {
        const { data, error } = await getUnreadCounts(user.id);
        
        if (error) {
          console.error('Error fetching unread counts:', error);
        } else if (data) {
          // Convert array to object with channel_id as keys
          const countsObject = {};
          data.forEach(item => {
            countsObject[item.channel_id] = item.unread_count;
          });
          setUnreadCounts(countsObject);
        }
      } catch (error) {
        console.error('Unread counts error:', error);
      }
    };

    fetchUnreadCounts();
    
    // Set up interval to refresh unread counts every 30 seconds
    const interval = setInterval(fetchUnreadCounts, 30000);
    
    return () => clearInterval(interval);
  }, [user, currentWorkspace]);

  const switchChannel = (channelId) => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setCurrentChannel(channel);
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
        error 
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
}; 