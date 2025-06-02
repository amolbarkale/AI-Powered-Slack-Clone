import { useState } from 'react';

const ThreadContainer = ({ message, onClose }) => {
  const [replyText, setReplyText] = useState('');
  
  // Mock data
  const parentMessage = message || {
    id: 1,
    user: { name: 'Jane Smith', avatar: 'JS', color: 'bg-purple-500' },
    content: 'Good morning everyone! Hope you all had a great weekend.',
    timestamp: '9:30 AM',
    reactions: [
      { emoji: '👍', count: 3 },
      { emoji: '❤️', count: 2 }
    ]
  };
  
  const replies = [
    {
      id: 101,
      user: { name: 'Bob Johnson', avatar: 'BJ', color: 'bg-yellow-500' },
      content: 'Good morning! Had a great weekend hiking.',
      timestamp: '9:32 AM',
      reactions: []
    },
    {
      id: 102,
      user: { name: 'Alice Williams', avatar: 'AW', color: 'bg-green-500' },
      content: 'Mine was relaxing. Ready for the week ahead!',
      timestamp: '9:35 AM',
      reactions: [
        { emoji: '👍', count: 1 }
      ]
    }
  ];
  
  const handleSendReply = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      // In a real app, this would send the reply to the backend
      console.log('Sending reply:', replyText);
      setReplyText('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="h-16 min-h-16 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="font-bold">Thread</div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Thread content */}
      <div className="flex-1 overflow-y-auto">
        {/* Parent message */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex">
            <div className={`w-9 h-9 rounded ${parentMessage.user.color} flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0`}>
              {parentMessage.user.avatar}
            </div>
            
            <div className="flex-1">
              <div className="flex items-baseline">
                <span className="font-bold">{parentMessage.user.name}</span>
                <span className="ml-2 text-xs text-gray-500">{parentMessage.timestamp}</span>
              </div>
              
              <div className="mt-1">{parentMessage.content}</div>
              
              {/* Reactions */}
              {parentMessage.reactions.length > 0 && (
                <div className="mt-2 flex space-x-1">
                  {parentMessage.reactions.map((reaction, index) => (
                    <div key={index} className="bg-gray-100 rounded-full px-2 py-0.5 text-xs flex items-center">
                      <span>{reaction.emoji}</span>
                      <span className="ml-1 text-gray-600">{reaction.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Replies */}
        <div className="p-4 space-y-4">
          <div className="text-xs text-gray-500 uppercase font-bold">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </div>
          
          {replies.map(reply => (
            <div key={reply.id} className="flex group hover:bg-gray-50 p-1 rounded">
              <div className={`w-8 h-8 rounded ${reply.user.color} flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0`}>
                {reply.user.avatar}
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline">
                  <span className="font-bold">{reply.user.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{reply.timestamp}</span>
                  
                  <div className="ml-auto hidden group-hover:flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mt-1">{reply.content}</div>
                
                {/* Reactions */}
                {reply.reactions.length > 0 && (
                  <div className="mt-2 flex space-x-1">
                    {reply.reactions.map((reaction, index) => (
                      <div key={index} className="bg-gray-100 rounded-full px-2 py-0.5 text-xs flex items-center">
                        <span>{reaction.emoji}</span>
                        <span className="ml-1 text-gray-600">{reaction.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Reply composer */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendReply} className="flex flex-col">
          <div className="flex-1 min-h-[40px] max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <textarea
              className="w-full h-full resize-none focus:outline-none"
              placeholder={`Reply to thread...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={1}
            />
          </div>
          
          <div className="flex justify-between mt-2">
            <div className="flex space-x-2">
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button type="button" className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={!replyText.trim()}
              className={`px-3 py-1 rounded ${replyText.trim() ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThreadContainer; 