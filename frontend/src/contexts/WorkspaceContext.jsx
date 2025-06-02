import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getWorkspaces, createWorkspace as apiCreateWorkspace } from '../lib/api';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchWorkspaces = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const { data, error: apiError } = await getWorkspaces();
          
          if (apiError) throw apiError;
          
          setWorkspaces(data);
          
          // Set current workspace if not already set
          if (data.length > 0 && !currentWorkspace) {
            setCurrentWorkspace(data[0]);
          }
        } catch (err) {
          console.error('Error fetching workspaces:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchWorkspaces();
    }
  }, [user, currentWorkspace]);

  const createWorkspace = async (name, description = '') => {
    try {
      setError(null);
      
      const { data, error: apiError } = await apiCreateWorkspace(name, description);
      
      if (apiError) throw apiError;
      
      setWorkspaces([...workspaces, data]);
      setCurrentWorkspace(data);
      return { data, error: null };
    } catch (err) {
      console.error('Error creating workspace:', err);
      setError(err.message);
      return { data: null, error: err };
    }
  };

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
        loading,
        error,
        createWorkspace,
        switchWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}; 