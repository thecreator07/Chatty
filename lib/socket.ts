'use client';

import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
  path: '/api/socketio',
  autoConnect: false,
  auth: (cb) => {
    cb({ token: localStorage.getItem('token') || '' });
  }
});