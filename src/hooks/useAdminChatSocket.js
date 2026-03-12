import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../constants/ServerUrl';

export default function useAdminChatSocket() {
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = io(API_BASE_URL, {
            auth: {
                role: 'admin',
            },
            withCredentials: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Admin socket connected: ', socket.id);

            socket.emit('admin:connect');
        });

        socket.on('admin:status', (data) => {
            console.log('Admin status broadcast: ', data.online);
        });

        socket.on('disconnect', () => {
            console.log('Admin socket disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return socketRef;
}