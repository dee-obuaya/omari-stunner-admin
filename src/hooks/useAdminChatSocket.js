import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../constants/ServerUrl';

const getId = (val) => {
    if (!val) return '';

    if (typeof val === 'string') return val;

    if (typeof val === 'object') {
        if (val._id) return String(val._id);
        return String(val);
    }

    return String(val);
};

const getSessionId = (session) =>
    getId(session._id || session.sessionId);

export default function useAdminChatSocket() {
    const socketRef = useRef(null);

    const [sessions, setSessions] = useState([]);
    const [messages, setMessages] = useState([]);

    const isConnectedRef = useRef(false);



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
            socket.emit('admin:join');

            isConnectedRef.current = true;
        });

        socket.on('chat:newSession', (session) => {
            console.log('New session received: ', session);

            setSessions(prev => {
                const newId = getId(session._id);

                const exists = prev.some(s => getId(s._id) ===  newId);
                if (exists) return prev;

                // return [{...session, _id: newId}, ...prev];
                return [
                    {
                        ...session,
                        _id: newId,
                        lastMessage: session.lastMessage || '',
                        lastMessageAt: session.lastMessageAt || session.startedAt
                    },
                    ...prev
                ];
            });
        });

        socket.on('chat:message', (msg) => {
            const msgSessionId = getId(msg.sessionId);
            console.log('Incoming message!!!')
            console.log(msg);
            // update session preview
            setSessions(prev =>
                prev.map(session =>
                    getSessionId(session) === msgSessionId
                        ? {
                            ...session,
                            lastMessage: msg.message,
                            lastMessageAt: msg.createdAt,
                        }
                        : session
                )
            );

            const normalized = {
                ...msg,
                sessionId: getId(msg.sessionId),
                status: msg.status || 'sent'
            };

            // add to messages if active session
            setMessages(prev => {
                const exists = prev.some(m => m._id === normalized._id);
                if (exists) return prev;

                return [...prev, normalized];
            });
        });

        socket.on('chat:history', (msgs) => {
            console.log('Admin history: ', msgs);

            const normalized = msgs.map(msg => ({
                ...msg,
                sessionId: getId(msg.sessionId),
                status: msg.status || 'sent'
            }));

            // duplicate message protection
            setMessages(prev => {
                const merged = [...prev];

                normalized.forEach(msg => {
                    const exists = merged.some(m => m._id === msg._id);
                    if (!exists) merged.push(msg);
                });

                return merged.sort(
                    (a,b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
            });
        })

        socket.on('message:status', ({ sessionId, status }) => {
            const priority = {sent: 1, delivered: 2, seen: 3};

            setMessages(prev =>
                prev.map(msg => {
                    if (msg.sessionId !== sessionId) return msg;

                    const current = priority[msg.status] || 0;
                    const incoming = priority[status] || 0;

                    if (incoming < current) return msg;

                    return { ...msg, status };
                })
            );
        });

        socket.on('admin:status', (data) => {
            console.log('Admin status update: ', data.online);
        });

        socket.on('disconnect', () => {
            console.log('Admin socket disconnected');
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const joinSession = (sessionId) => {
        if (!socketRef.current || !isConnectedRef.current) return;

        console.log('🟢 Joining session:', sessionId);

        // setMessages([]); // clear old messages

        socketRef.current.emit('admin:joinSession', { sessionId });
    };

    const markSeen = (sessionId) => {
        if (!socketRef.current || !isConnectedRef.current) return;

        console.log('👁️ Marking seen:', sessionId);

        socketRef.current.emit('message:seen', { sessionId });
    };

    const sendMessage = (sessionId, message) => {
        if (!socketRef.current || !isConnectedRef.current) return;
        socketRef.current.emit('admin:sendMessage', { sessionId, message });
    };

    return {
        sessions,
        setSessions,
        messages,
        joinSession,
        markSeen,
        sendMessage,
    };
}