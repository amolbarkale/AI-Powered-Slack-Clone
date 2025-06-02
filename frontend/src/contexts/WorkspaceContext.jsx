import { createContext, useContext, useState, useEffect } from 'react';
import { getWorkspaces } from '../lib/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await getWorkspaces();
        
        if (error) {
          setError(error.message);
        } else {
          setWorkspaces(data);
          
          // Set the first workspace as current if none is selected
          if (data.length > 0 && !currentWorkspace) {
            setCurrentWorkspace(data[0]);
          }
        }
      } catch (error) {
        console.error('Workspace error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, currentWorkspace]);

  const switchWorkspace = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  return (
    <WorkspaceContext.Provider 
      value={{ 
        workspaces, 
        currentWorkspace, 
        switchWorkspace, 
        loading, 
        error 
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}; 