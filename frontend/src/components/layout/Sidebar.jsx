import { useState } from 'react';

const Sidebar = () => {
  const [activeSection, setActiveSection] = useState('channels');
  
  // Mock data
  const workspaces = [
    { id: 1, name: 'Workspace 1', initial: 'W' }
  ];
  
  const channels = [
    { id: 1, name: 'general', unread: 0, isActive: true },
    { id: 2, name: 'random', unread: 3, isActive: false },
    { id: 3, name: 'announcements', unread: 0, isActive: false },
    { id: 4, name: 'project-alpha', unread: 12, isActive: false }
  ];
  
  const directMessages = [
    { id: 1, name: 'John Doe', status: 'online', unread: 0, isActive: false },
    { id: 2, name: 'Jane Smith', status: 'away', unread: 2, isActive: false },
    { id: 3, name: 'Bob Johnson', status: 'offline', unread: 0, isActive: false }
  ];

  return (
    <div className="bg-[#19171D] text-white w-60 flex-shrink-0 flex flex-col h-full">
      {/* Workspace selector */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center text-xs font-bold">
            {workspaces[0].initial}
          </div>
          <span className="font-bold">{workspaces[0].name}</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Search */}
      <div className="p-3">
        <div className="bg-gray-700 rounded flex items-center px-3 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-400 text-sm">Search</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-2 px-3">
        <button className="flex items-center text-gray-400 hover:text-white w-full py-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </button>
        <button className="flex items-center text-gray-400 hover:text-white w-full py-1 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          DMs
        </button>
        <button className="flex items-center text-gray-400 hover:text-white w-full py-1 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Saved
        </button>
      </nav>
      
      {/* Channels */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <div 
          className="px-3 flex items-center justify-between cursor-pointer hover:text-white text-gray-300"
          onClick={() => setActiveSection(activeSection === 'channels' ? '' : 'channels')}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 transition-transform ${activeSection === 'channels' ? 'transform rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium">Channels</span>
          </div>
          <button className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        {activeSection === 'channels' && (
          <ul className="mt-1 space-y-1">
            {channels.map(channel => (
              <li key={channel.id}>
                <a 
                  href="#" 
                  className={`px-3 py-1 text-sm flex items-center ${channel.isActive ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <span className="mr-2 text-gray-500">#</span>
                  <span>{channel.name}</span>
                  {channel.unread > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 rounded-full">
                      {channel.unread}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
        
        {/* Direct Messages */}
        <div 
          className="px-3 mt-4 flex items-center justify-between cursor-pointer hover:text-white text-gray-300"
          onClick={() => setActiveSection(activeSection === 'dms' ? '' : 'dms')}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 transition-transform ${activeSection === 'dms' ? 'transform rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium">Direct Messages</span>
          </div>
          <button className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        {activeSection === 'dms' && (
          <ul className="mt-1 space-y-1">
            {directMessages.map(dm => (
              <li key={dm.id}>
                <a 
                  href="#" 
                  className={`px-3 py-1 text-sm flex items-center ${dm.isActive ? 'bg-blue-900 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <span className="w-2 h-2 rounded-full mr-2 flex-shrink-0" 
                    style={{ backgroundColor: dm.status === 'online' ? '#2BAC76' : dm.status === 'away' ? '#ECB22E' : '#616061' }}
                  />
                  <span>{dm.name}</span>
                  {dm.unread > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 rounded-full">
                      {dm.unread}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* User profile */}
      <div className="p-3 border-t border-gray-700 flex items-center">
        <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-xs font-bold mr-2">
          JD
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">John Doe</div>
          <div className="text-xs text-gray-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 