import { useState } from 'react';
import Sidebar from './Sidebar';
import ChannelPane from './ChannelPane';
import MessagePane from './MessagePane';
import ThreadContainer from './ThreadContainer';

const AppLayout = () => {
  const [showThread, setShowThread] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const toggleThread = (message = null) => {
    if (message) {
      setSelectedMessage(message);
      setShowThread(true);
    } else {
      setShowThread(!showThread);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Workspaces and channels list */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Channel pane - Channel info and messages */}
        <div className={`flex-1 flex flex-col overflow-hidden ${showThread ? 'lg:w-7/12' : 'w-full'}`}>
          <ChannelPane />
          <MessagePane onThreadClick={toggleThread} />
        </div>
        
        {/* Thread pane - Appears when a thread is selected */}
        {showThread && (
          <div className="hidden lg:flex lg:w-5/12 border-l border-gray-200 flex-col">
            <ThreadContainer 
              message={selectedMessage} 
              onClose={() => setShowThread(false)} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLayout; 