import { createContext, useContext, useState, useEffect } from 'react';
import { useCollaboration } from './CollaborationContext';
import api from '../services/api';

const ArenaContext = createContext();

export const useArena = () => {
  const context = useContext(ArenaContext);
  if (!context) {
    throw new Error('useArena must be used within ArenaProvider');
  }
  return context;
};

export function ArenaProvider({ children }) {
  const [arenas, setArenas] = useState([]);
  const [selectedArena, setSelectedArena] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useCollaboration();

  // Fetch arenas on mount
  useEffect(() => {
    const fetchArenas = async () => {
      try {
        const response = await api.get('/arenas');
        setArenas(response.data.data.arenas);
      } catch (error) {
        console.error('Failed to fetch arenas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArenas();
  }, []);

  // Join arena room when selected
  useEffect(() => {
    if (!selectedArena || !socket || !isConnected) return;

    socket.emit('arena:join', { arenaId: selectedArena.id });

    return () => {
      socket.emit('arena:leave', { arenaId: selectedArena.id });
    };
  }, [selectedArena, socket, isConnected]);

  // Listen to arena updates
  useEffect(() => {
    if (!socket) return;

    socket.on('arena:updated', ({ arena }) => {
      setArenas(prev => prev.map(a => a.id === arena.id ? arena : a));
      if (selectedArena?.id === arena.id) {
        setSelectedArena(arena);
      }
    });

    socket.on('arena:deleted', ({ arenaId }) => {
      setArenas(prev => prev.filter(a => a.id !== arenaId));
      if (selectedArena?.id === arenaId) {
        setSelectedArena(null);
      }
    });

    socket.on('battle:created', ({ battle }) => {
      // Refresh arena stats if needed
      if (selectedArena && battle.arenaId === selectedArena.id) {
        // Optionally refetch or update count
      }
    });

    return () => {
      socket.off('arena:updated');
      socket.off('arena:deleted');
      socket.off('battle:created');
    };
  }, [socket, selectedArena]);

  const createArena = async (data) => {
    const response = await api.post('/arenas', data);
    const newArena = response.data.data.arena;
    setArenas(prev => [newArena, ...prev]);
    return newArena;
  };

  const updateArena = async (arenaId, data) => {
    const response = await api.put(`/arenas/${arenaId}`, data);
    const updated = response.data.data.arena;
    setArenas(prev => prev.map(a => a.id === arenaId ? updated : a));
    return updated;
  };

  const deleteArena = async (arenaId) => {
    await api.delete(`/arenas/${arenaId}`);
    setArenas(prev => prev.filter(a => a.id !== arenaId));
    if (selectedArena?.id === arenaId) {
      setSelectedArena(null);
    }
  };

  return (
    <ArenaContext.Provider
      value={{
        arenas,
        selectedArena,
        setSelectedArena,
        loading,
        createArena,
        updateArena,
        deleteArena
      }}
    >
      {children}
    </ArenaContext.Provider>
  );
}
