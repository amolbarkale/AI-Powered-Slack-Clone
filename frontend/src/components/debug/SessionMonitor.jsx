import React, { useState, useEffect } from 'react';
import { sessionUtils } from '../../lib/supabase';

const SessionMonitor = () => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-4), `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    const updateSessionInfo = async () => {
      const info = await sessionUtils.getSessionInfo();
      setSessionInfo(info);
      addLog(`Session check: ${info.valid ? 'Valid' : 'Invalid'}`);
    };

    // Update immediately
    updateSessionInfo();

    // Update every 30 seconds
    const interval = setInterval(updateSessionInfo, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug Session
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Session Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      {sessionInfo ? (
        <div className="text-xs space-y-2">
          <div>
            <strong>Status:</strong> 
            <span className={sessionInfo.valid ? 'text-green-600' : 'text-red-600'}>
              {sessionInfo.valid ? ' Valid' : ' Invalid'}
            </span>
          </div>
          
          {sessionInfo.valid ? (
            <>
              <div><strong>User:</strong> {sessionInfo.user}</div>
              <div><strong>Expires:</strong> {sessionInfo.expiresAt?.toLocaleString()}</div>
              <div>
                <strong>Time left:</strong> {Math.round(sessionInfo.timeUntilExpiry / 1000 / 60)} min
              </div>
            </>
          ) : (
            <div><strong>Error:</strong> {sessionInfo.error}</div>
          )}
          
          <div className="flex flex-col space-y-1">
            <button
              onClick={async () => {
                const result = await sessionUtils.refreshSession();
                addLog(`Refresh: ${result.success ? 'Success' : result.error}`);
                const info = await sessionUtils.getSessionInfo();
                setSessionInfo(info);
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
            >
              Refresh Session
            </button>
            
            <button
              onClick={async () => {
                const result = await sessionUtils.recoverSession();
                addLog(`Recovery: ${result.success ? 'Success' : result.error}`);
                const info = await sessionUtils.getSessionInfo();
                setSessionInfo(info);
              }}
              className="bg-orange-500 text-white px-2 py-1 rounded text-xs"
            >
              Recover Session
            </button>
            
            <button
              onClick={() => {
                console.log('=== SESSION DEBUG INFO ===');
                console.log('LocalStorage auth token:', localStorage.getItem('supabase.auth.token'));
                console.log('SessionStorage backup:', sessionStorage.getItem('supabase.auth.token_backup'));
                console.log('User state:', localStorage.getItem('slack_user_state'));
                addLog('Debug info logged to console');
              }}
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
            >
              Log Debug Info
            </button>
          </div>

          {logs.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <strong className="text-xs">Recent Activity:</strong>
              <div className="text-xs text-gray-600 space-y-1 mt-1">
                {logs.map((log, index) => (
                  <div key={index} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs">Loading...</div>
      )}
    </div>
  );
};

export default SessionMonitor; 