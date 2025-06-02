import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthLayout: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* <div className="mx-auto h-12 w-12 bg-[#3C1042] rounded-lg flex items-center justify-center mb-4"> */}
            <img className='mx-auto h-24 w-24' src="./slack-icon.png" alt="Icon" />
          {/* </div> */}
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your workspace' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Join your team and start collaborating.'}
          </p>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>

        {/* Demo credentials hint */}
        {isLogin && (
          <div className="mt-6 p-4 rounded-md border bg-blue-50 border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Demo Credentials
            </h4>
            <p className="text-xs text-blue-700">
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
