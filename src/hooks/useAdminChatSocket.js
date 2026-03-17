import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../constants/ServerUrl';

export default function useAdminChatSocket() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = io(API_BASE_URL, {
            auth: {
                role: 'admin',
            },
            withCredentials: true,
        });

        setSocket(s);

        s.on('connect', () => {
            console.log('Admin socket connected: ', s.id);

            s.emit('admin:connect');
        });

        s.on('admin:status', (data) => {
            console.log('Admin status update: ', data.online);
        });

        s.on('disconnect', () => {
            console.log('Admin socket disconnected');
        });

        return () => {
            s.disconnect();
        };
    }, []);

    return {
        socket
    };
}