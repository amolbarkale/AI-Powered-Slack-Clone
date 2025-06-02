import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import Header from '../components/chat/Header';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import ThreadPanel from '../components/chat/ThreadPanel';

const ChatLayout = () => {
  const { user, loading } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    // Set a timeout to show a message if loading takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 3000); // 3 seconds
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Force render auth layout after 10 seconds if still loading
  useEffect(() => {
    const forceRenderTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Force rendering auth layout after timeout');
        // This will cause a re-render and show the auth layout
        setLoadingTimeout(true);
      }
    }, 10000); // 10 seconds
    
    return () => clearTimeout(forceRenderTimeout);
  }, [loading]);

  // If loading for too long, show auth layout
  if (loading && loadingTimeout) {
    console.log('Loading timeout reached, showing auth layout');
    return <AuthLayout />;
  }

  // Show loading spinner only for a short time
  if (loading && !loadingTimeout) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // No user, show auth layout
  if (!user) {
    return <AuthLayout />;
  }

  // User is logged in, show chat layout
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