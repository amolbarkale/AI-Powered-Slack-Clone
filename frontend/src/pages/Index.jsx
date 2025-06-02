import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import Header from '../components/chat/Header';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import ThreadPanel from '../components/chat/ThreadPanel';

const ChatLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthLayout />;
  }

  return (
    <div className="h-screen flex flex-col bg-white transition-colors">
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
  return <ChatLayout />;
};

export default Index; 