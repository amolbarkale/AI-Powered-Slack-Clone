
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthLayout: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isDarkMode } = useChat();

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">S</span>
          </div>
          <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isLogin ? 'Sign in to your workspace' : 'Create your account'}
          </h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Join your team and start collaborating.'}
          </p>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>

        {/* Demo credentials hint */}
        {isLogin && (
          <div className={`mt-6 p-4 rounded-md border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <h4 className={`text-sm font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-800'} mb-2`}>
              Demo Credentials
            </h4>
            <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              Email: john@company.com<br />
              Password: password
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthLayout;
