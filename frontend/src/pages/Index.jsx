import React, { useEffect } from 'react';
import { ChatProvider, useChat } from '../contexts/ChatContext';
import AuthLayout from '../components/auth/AuthLayout';
import Header from '../components/chat/Header';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import ThreadPanel from '../components/chat/ThreadPanel';

const ChatLayout = () => {
  const { isDarkMode, isAuthenticated } = useChat();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isAuthenticated) {
    return <AuthLayout />;
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChatArea />
        <ThreadPanel />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
};

export default Index; 