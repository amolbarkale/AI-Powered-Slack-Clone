import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

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

  // For demo purposes, let's create a mock workspace
  const mockWorkspace = {
    id: 'workspace-1',
    name: 'Demo Workspace',
    slug: 'demo',
    created_at: new Date().toISOString(),
    owner_id: user?.id || 'demo-user',
  };

  useEffect(() => {
    if (user) {
      const fetchWorkspaces = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // In a real app, fetch from Supabase
          // const { data, error } = await supabase
          //   .from('workspaces')
          //   .select('*')
          //   .or(`owner_id.eq.${user.id},members.cs.{${user.id}}`);
          
          // if (error) throw error;
          
          // For demo purposes, use mock data
          const mockData = [mockWorkspace];
          
          setWorkspaces(mockData);
          
          // Set current workspace if not already set
          if (mockData.length > 0 && !currentWorkspace) {
            setCurrentWorkspace(mockData[0]);
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

  const createWorkspace = async (name) => {
    try {
      setError(null);
      
      // In a real app, insert to Supabase
      // const { data, error } = await supabase
      //   .from('workspaces')
      //   .insert([{ name, owner_id: user.id, slug: name.toLowerCase().replace(/\s+/g, '-') }])
      //   .select()
      //   .single();
      
      // if (error) throw error;
      
      // For demo purposes, create mock data
      const newWorkspace = {
        id: `workspace-${workspaces.length + 1}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        created_at: new Date().toISOString(),
        owner_id: user?.id || 'demo-user',
      };
      
      setWorkspaces([...workspaces, newWorkspace]);
      return { data: newWorkspace, error: null };
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