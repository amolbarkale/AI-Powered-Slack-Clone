
import React, { useState } from 'react';
import { MoreVertical, MessageSquare, Heart, Smile, Reply, Edit3, Trash2, Copy } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { Message } from '../../contexts/ChatContext';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import FilePreview from './FilePreview';

interface MessageBubbleProps {
  message: Message;
  showThreadButton?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showThreadButton = true }) => {
  const { setActiveThread, toggleThreadPanel, addReaction, removeReaction, currentUser, editMessage, deleteMessage } = useChat();
  const [showActions, setShowActions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isOwner = currentUser?.id === message.user.id;
  const commonEmojis = ['👍', '❤️', '😊', '😂', '😮', '😢', '🎉', '🔥'];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleReaction = async (emoji: string) => {
    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    const userHasReacted = existingReaction?.users.includes(currentUser?.id || '');

    if (userHasReacted) {
      await removeReaction(message.id, emoji);
    } else {
      await addReaction(message.id, emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleEdit = async () => {
    if (editContent.trim() !== message.content) {
      await editMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(message.id);
    }
  };

  const openThread = () => {
    setActiveThread(message.id);
    toggleThreadPanel(true);
  };

  const handleFilePreview = (file: any) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMessage = (content: string) => {
    // Simple formatting for bold, italic, code
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">$1</code>');
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <>
      <div 
        className="flex items-start space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Avatar */}
        <img
          src={message.user.avatar}
          alt={message.user.name}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white">
              {message.user.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.timestamp)}
            </span>
            {message.edited && (
              <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
            )}
          </div>

          {/* Message Text */}
          {message.content && (
            <div className="text-gray-900 dark:text-white">
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={handleEdit}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{formatMessage(message.content)}</div>
              )}
            </div>
          )}

          {/* File Attachments */}
          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.files.map((file) => (
                <div key={file.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 max-w-md">
                  {file.type.startsWith('image/') ? (
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleFilePreview(file)}
                    >
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="max-w-full h-auto rounded-md mb-2"
                        style={{ maxHeight: '200px' }}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{file.name}</p>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                      onClick={() => handleFilePreview(file)}
                    >
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                          {file.type.split('/')[1]?.toUpperCase().slice(0, 3) || 'FILE'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction) => {
                const userHasReacted = reaction.users.includes(currentUser?.id || '');
                return (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleReaction(reaction.emoji)}
                    className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full border transition-colors ${
                      userHasReacted 
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200' 
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && !isEditing && (
          <div className="flex items-center space-x-1 opacity-100 group-hover:opacity-100 transition-opacity">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-8 w-8 p-0"
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
                        onClick={() => handleReaction(emoji)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {showThreadButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={openThread}
                className="h-8 w-8 p-0"
              >
                <MessageSquare size={16} />
              </Button>
            )}
            
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedFile(null);
          }}
        />
      )}
    </>
  );
};

export default MessageBubble;
