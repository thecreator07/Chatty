// components/Chat.tsx
'use client';

import { useSocket } from 'context/SocketContext';
import { useState, useEffect } from 'react';

export default function SimpleChat() {
  const { socket, isConnected } = useSocket();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  // Receive messages
  useEffect(() => {
    if (!socket) return;
console.log("socket",socket)
    const handleMessage = (newMessage: string) => {
      setMessages(prev => [...prev, newMessage]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  // Send message
  const sendMessage = () => {
    if (message.trim() && isConnected) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </h1>
      
      <div className="mb-4 h-60 overflow-y-auto border p-2">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2 p-2 bg-gray-100 rounded">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border p-2 rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}