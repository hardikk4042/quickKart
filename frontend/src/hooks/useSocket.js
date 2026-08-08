// src/hooks/useSocket.js
// Socket.IO client hook — stubbed for future real-time integration
import { useEffect, useRef } from 'react';

export const useSocket = (orderId, onUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;

    // TODO: When backend is ready, replace with:
    // import { io } from 'socket.io-client';
    // const socket = io(import.meta.env.VITE_SOCKET_URL, { auth: { token } });
    // socket.emit('join:order', orderId);
    // socket.on('order:update', onUpdate);
    // socketRef.current = socket;

    // Mock: simulate order status progression
    const mockStatuses = ['packing', 'ready', 'out_for_delivery', 'delivered'];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < mockStatuses.length) {
        onUpdate?.({ status: mockStatuses[idx], orderId });
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 15000); // update every 15s in demo

    return () => {
      clearInterval(interval);
      socketRef.current?.disconnect();
    };
  }, [orderId]);

  return socketRef.current;
};
