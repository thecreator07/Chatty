'use client';
import { useEffect } from 'react';
import { Message } from '../model/Message';
import { useSocket } from 'context/SocketContext';

export const useChat = (chatId?: string) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !chatId) return;

    // Join chat room
    socket.emit('joinChat', chatId);

    return () => {
      socket.emit('leaveChat', chatId);
    };
  }, [socket, chatId]);

  const sendMessage = (message: {
    content: string;
    messageType: 'text' | 'image' | 'video' | 'file';
    mediaUrl?: string;
  }) => {
    if (!socket || !chatId) return;
    
    socket.emit('sendMessage', {
      chatId,
      ...message
    });
  };

  const markAsRead = (messageId: string) => {
    if (!socket) return;
    socket.emit('markAsRead', messageId);
  };

  return {
    sendMessage,
    markAsRead
  };
};