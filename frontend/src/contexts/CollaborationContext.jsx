import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const CollaborationContext = createContext();

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};

export function CollaborationProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeBattle, setActiveBattle] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const listenersRef = useRef(new Map());

  // Initialiser la connexion socket quand le token est disponible
  useEffect(() => {
    console.log('[CollaborationContext] useEffect triggered, token:', token ? 'EXISTS' : 'NULL');

    if (!token) {
      console.log('[CollaborationContext] No token, skipping socket creation');
      // Déconnecter si plus de token
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Créer la connexion socket
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const socketUrl = apiUrl.replace('/api', '');

    console.log('[CollaborationContext] Creating socket connection to:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token }
    });

    // Event: Connexion réussie
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    // Event: Déconnexion
    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Event: Erreur
    newSocket.on('error', ({ message }) => {
      console.error('Socket error:', message);
      toast.error(message || 'Erreur de connexion temps réel');
    });

    setSocket(newSocket);

    // Cleanup à la déconnexion
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Rejoindre une battle room
  const joinBattle = (battleId) => {
    if (!socket || !isConnected) {
      console.warn('Cannot join battle: socket not connected');
      return;
    }

    socket.emit('battle:join', { battleId });
    setActiveBattle(battleId);
    console.log(`Joining battle: ${battleId}`);
  };

  // Quitter une battle room
  const leaveBattle = (battleId) => {
    if (!socket || !isConnected) return;

    socket.emit('battle:leave', { battleId });
    setActiveBattle(null);
    setOnlineUsers([]);

    // Nettoyer tous les listeners
    listenersRef.current.forEach((listener, event) => {
      socket.off(event, listener);
    });
    listenersRef.current.clear();

    console.log(`Left battle: ${battleId}`);
  };

  // Écouter un event
  const on = (event, callback) => {
    if (!socket) return;

    socket.on(event, callback);
    listenersRef.current.set(event, callback);
  };

  // Arrêter d'écouter un event
  const off = (event) => {
    if (!socket) return;

    const listener = listenersRef.current.get(event);
    if (listener) {
      socket.off(event, listener);
      listenersRef.current.delete(event);
    }
  };

  // Émettre un event
  const emit = (event, data) => {
    if (!socket || !isConnected) {
      console.warn('Cannot emit event: socket not connected');
      return;
    }

    socket.emit(event, data);
  };

  // Listeners globaux pour gérer les utilisateurs en ligne
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = ({ user, role }) => {
      setOnlineUsers(prev => {
        // Éviter les doublons
        if (prev.find(u => u.id === user.id)) return prev;
        return [...prev, { ...user, role }];
      });
      toast.success(`${user.name || user.email} a rejoint la battle`);
    };

    const handleUserLeft = ({ user }) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
      toast.info(`${user.name || user.email} a quitté la battle`);
    };

    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);

    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
    };
  }, [socket]);

  const value = {
    socket,
    isConnected,
    activeBattle,
    onlineUsers,
    joinBattle,
    leaveBattle,
    on,
    off,
    emit
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}
