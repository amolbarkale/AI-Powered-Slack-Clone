const ChannelPane = () => {
  // Mock data
  const channel = {
    name: 'general',
    topic: 'Company-wide announcements and work-based matters',
    memberCount: 42
  };

  return (
    <div className="h-16 min-h-16 border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0">
      <div className="flex items-center">
        <div className="font-bold text-lg">
          <span className="text-gray-500 mr-1">#</span>
          {channel.name}
        </div>
        
        <button className="ml-2 text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Channel topic */}
        {channel.topic && (
          <div className="hidden md:block max-w-md truncate text-sm text-gray-500">
            {channel.topic}
          </div>
        )}
        
        {/* Member count */}
        <button className="flex items-center text-gray-500 hover:text-gray-700 text-sm border-l border-gray-200 pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {channel.memberCount}
        </button>
        
        {/* Search in channel */}
        <button className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        {/* Info/Settings */}
        <button className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChannelPane; 