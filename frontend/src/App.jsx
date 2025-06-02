import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ChannelProvider } from './contexts/ChannelContext';
import { useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import './App.css';

// Import pages (to be created later)
const SignIn = () => <div className="h-screen flex items-center justify-center bg-gray-100">Sign In Page</div>;
const SignUp = () => <div className="h-screen flex items-center justify-center bg-gray-100">Sign Up Page</div>;

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  return children;
};

function AppContent() {
  // For demo purposes, we'll bypass authentication
  const bypassAuth = true;
  
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={bypassAuth ? <Navigate to="/" replace /> : <SignIn />} />
        <Route path="/signup" element={bypassAuth ? <Navigate to="/" replace /> : <SignUp />} />
        <Route 
          path="/" 
          element={
            bypassAuth ? (
              <WorkspaceProvider>
                <ChannelProvider>
                  <AppLayout />
                </ChannelProvider>
              </WorkspaceProvider>
            ) : (
              <ProtectedRoute>
                <WorkspaceProvider>
                  <ChannelProvider>
                    <AppLayout />
                  </ChannelProvider>
                </WorkspaceProvider>
              </ProtectedRoute>
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
