
import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, BarChart3, Mic, Bold, Italic, Code, AtSign } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import FileUpload from './FileUpload';

interface MessageComposerProps {
  threadId?: string;
  placeholder?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ 
  threadId, 
  placeholder = "Message #general" 
}) => {
  const { sendMessage, activeChannel, channels, currentUser } = useChat();
  const [message, setMessage] = useState('');
  const [showToneAnalyzer, setShowToneAnalyzer] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChannelData = channels?.find(c => c.id === activeChannel);
  const actualPlaceholder = placeholder === "Message #general" 
    ? `Message ${activeChannelData?.type === 'public' || activeChannelData?.type === 'private' ? '#' : '@'}${activeChannelData?.name}` 
    : placeholder;

  const commonEmojis = ['😊', '👍', '❤️', '😂', '😮', '😢', '🎉', '🔥'];
  const mockUsers = [
    { id: 'user_1', name: 'John Doe' },
    { id: 'user_2', name: 'Sarah Chen' },
    { id: 'user_3', name: 'Mike Johnson' },
    { id: 'user_4', name: 'Emily Davis' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message, threadId);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const insertFormatting = (format: 'bold' | 'italic' | 'code') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.slice(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
    }

    const newMessage = message.slice(0, start) + formattedText + message.slice(end);
    setMessage(newMessage);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const insertMention = (user: { id: string; name: string }) => {
    const newMessage = message.replace(new RegExp(`@${mentionQuery}$`), `@${user.name} `);
    setMessage(newMessage);
    setShowMentions(false);
    setMentionQuery('');
    textareaRef.current?.focus();
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Check for @ mentions
    const lastWord = value.split(' ').pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionQuery(lastWord.slice(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery('');
    }
  };

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <>
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Formatting Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('bold')}
                className="h-8 w-8 p-0"
              >
                <Bold size={14} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('italic')}
                className="h-8 w-8 p-0"
              >
                <Italic size={14} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('code')}
                className="h-8 w-8 p-0"
              >
                <Code size={14} />
              </Button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowToneAnalyzer(!showToneAnalyzer)}
                className={`text-xs ${showToneAnalyzer ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`}
              >
                <BarChart3 size={14} className="mr-1" />
                📊 Analyze Tone
              </Button>
            </div>
          </div>

          {/* Message Input */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyPress={handleKeyPress}
              placeholder={actualPlaceholder}
              className="min-h-[60px] max-h-32 resize-none pr-20 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
            />
            
            {/* Mentions Dropdown */}
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-w-xs z-10">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => insertMention(user)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <AtSign size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Input Actions */}
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUpload(true)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Paperclip size={16} />
              </Button>
              
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Smile size={16} />
                </Button>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg z-10">
                    <div className="grid grid-cols-4 gap-1">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Mic size={16} />
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim()}
                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>

          {/* Tone Analysis Display */}
          {showToneAnalyzer && message.trim() && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Tone Analysis</span>
                <span className="text-xs text-orange-600 dark:text-orange-400">AI Feature Preview</span>
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">
                📊 Professional • 😊 Friendly • 💪 Confident
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Your message appears professional and positive. AI analysis coming soon!
              </p>
            </div>
          )}
        </form>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          isOpen={showFileUpload}
          onClose={() => setShowFileUpload(false)}
          channelId={activeChannel}
          threadId={threadId}
        />
      )}
    </>
  );
};

export default MessageComposer;
