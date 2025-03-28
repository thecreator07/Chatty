'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { socket } from 'lib/socket';
import { useSession } from 'next-auth/react';

const SocketContext = createContext({
  socket: socket,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();
console.log("session",session)
  useEffect(() => {
    if (session?.user&&session?.user?.token) {
      localStorage.setItem('token', session.user.token);
      
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
      socket.connect();

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.disconnect();
        localStorage.removeItem('token');
      };
    }
  }, [session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};