/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, API_BASE_URL } from '../constants/ServerUrl';
import { useAuth } from '../contexts/AuthContext';

// throttle helper for typing events
function throttle(fn, wait) {
    let last = 0;
    return (...args) => {
        const now = Date.now();
        if (now - last >= wait) {
            last = now;
            fn(...args);
        }
    };
}

export default function useAdminChatSocket() {
    const { user } = useAuth(); // your auth context; ensure it provides user._id
    const socketRef = useRef(null);
    // const listenersRef = useRef({}); // to prevent duplicate listeners
    const [connected, setConnected] = useState(false);

    // sessions (chat list)
    const [sessions, setSessions] = useState([]); // what CHatList expects
    // messages for the currently selected session
    const [messages, setMessages] = useState([]); //ChatBox expects an array
    const [activeSessionId, setActiveSessionId] = useState(null);

    const [incomingMessage, setIncomingMessage] = useState(null);
    const [incomingSession, setIncomingSession] = useState(null);
    const [typingState, setTypingState] = useState(null);

    // stable refs to avoid stale closures
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
        console.log(user)
    }, [user]);

    const activeSessionRef = useRef(null);

    // ---------- Helper: normalize message shape ----------
    const normalizeMessage = (raw = {}) => {
        return {
            _id: raw._id || raw.id || String(Math.random()).slice(2),
            sessionId: raw.sessionId || raw.session || null,
            senderType: raw.senderType || raw.type || raw.sender || 'visitor',
            senderId: raw.senderId || raw.sender || null,
            message: raw.message || raw.content || '',
            isSystem: !!raw.isSystem,
            status: raw.status || 'sent',
            meta: raw.meta || {},
            createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        };
    };

    // fetch initial sessions (admin list)
    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/chats/admin/chats`, {
                credentials: 'include'
            });

            const data = await res.json();

            const list = Array.isArray(data.sessions) ? data.sessions : data.chats || [];
            setSessions(list);
        } catch (err) {
            console.error('Failed to fetch sessions: ', err);
            setSessions([]);
        }
    }, [])

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    useEffect(() => {
        activeSessionRef.current = activeSessionId;
    }, [activeSessionId]);

    // ------ Init socket (single instance) ------
    useEffect(() => {
        if (!user) return; // wait for auth context
        if (socketRef.current) return; // already connected

        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            withCredentials: true,
            auth: {
                // admin: true,
                staffId: user?._id
            }
        });

        socketRef.current = socket;

        // basic lifecycle
        socket.on('connect', () => {
            setConnected(true);
            socket.emit('admin:join', {adminId: user?._id});
            console.log('Admin socket connected: ', socket.id);
        });

        socket.on('disconnect', (reason) => {
            setConnected(false);
            console.log('Admin socket disconnected', reason);
        });

        // // Avoid attaching duplicate handlers by keeping track in listenersRef
        // session:new -> server tells admin a new session started
        // when a visitor starts a new chat
        // if (!listenersRef.current['session:new']) {
        socket.on('session:new', (session) => {
            // listenersRef.current['session:new'] = true;
            console.log('new chat session: ', session);

            setSessions(prev => {
                if (prev.find((p) => p.sessionId === session.sessionId)) return prev;
                return [session, ...prev];
            })
            setIncomingSession(session);
        });
        // }

        // when a new message arrives
        // if (!listenersRef.current['message:new']) {
        socket.on('message:new', (rawMsg) => {
            // listenersRef.current['message:new'] = true;

            const msg = normalizeMessage(rawMsg);
            console.log('new message: ', msg);
            setIncomingMessage(msg);


            // if it's for the currently open session, append to messages
            setMessages((prev) => {
                if (msg.sessionId === activeSessionRef.current) {
                    return [...prev, msg];
                }
                return prev;
            });

            // update sessions preview and bump it to top
            setSessions((prev) => {
                const other = prev.filter((s) => s.sessionId !== msg.sessionId);
                const existing = prev.find((s) => s.sessionId === msg.sessionId);
                const updated = {
                    ...existing,
                    lastMessage: msg.message,
                    lastMessageAt: msg.createdAt,
                    isOpen: existing ? existing.isOpen : true,
                    unread: msg.sessionId !== activeSessionRef.current
                };

                return [updated, ...other];
            });
        });
        // }

        // visitor is typing
        // if (!listenersRef.current['typing']) {
        socket.on('typing', (data) => {
            // listenersRef.current['typing'] = true;

            if (data.senderType === 'visitor') {
                setTypingState({
                    sessionId: data.sessionId,
                    isTyping: true,
                });

                setTimeout(() => {
                    setTypingState(null);
                }, 1500);
            }
        });
        // }

        // message:status (delivered/seen updates)
        // if (!listenersRef.current['message:status']) {
        socket.on('message:status', ({ messageId, status }) => {
            // listenersRef.current['message:status'] = true;
            setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, status } : m)));
        });
        // }

        // cleanup on unmount
        return () => {
            try {
                socket.off('session:new');
                socket.off('message:new');
                socket.off('typing');
                socket.off('message:status');
                socket.disconnect();
            } catch (e) {
                // ignore
            }
            socketRef.current = null;
            // listenersRef.current = {};
        };
    }, [user, activeSessionId]);

    // ------ Connect to specific session (admin selects a chat) ------
    const connectToSession = useCallback(
        async (sessionId) => {
            if (!sessionId) return;

            setActiveSessionId(sessionId);
            setMessages([]); // reset while loading

            // emit to join the room on server so this admin receives updates
            const socket = socketRef.current;
            if (socket && socket.connected) {
                socket.emit('admin:joinSession', {sessionId});
            }

            // fetch messages for that session from the API
            try {
                const res = await fetch(`${API_BASE_URL}/api/chats/admin/${encodeURIComponent(sessionId)}/messages`,
                    {
                        credentials: 'include',
                    }
                );
                const data = await res.json();
                const msgs = Array.isArray(data.messages) ? data.messages : data || [];
                const normalized = msgs.map(normalizeMessage);
                setMessages(normalized);
            } catch (err) {
                console.error('Failed to fetch messages for session: ', err);
                setMessages([]);
            }
        },
    [])

    // ------ Send Message ------
    const sendMessage = useCallback((sessionId, text) => {
        if (!sessionId || !text || !socketRef.current) return;
        const socket = socketRef.current;

        // create a local optimistic message for instant UI feedback
        const optimistic = normalizeMessage({
            id: `local-${Date.now()}`,
            sessionId,
            senderType: 'admin',
            senderId: userRef.current ? userRef.current._id : null,
            message: text,
            status: 'sent',
            createdAt: new Date().toISOString(),
        });

        setMessages((prev) => [...prev, optimistic]);

        socket.emit('message:send', {
                sessionId,
                senderType: 'admin',
                message: text,
            },

            // optional ack callback
            (ack) => {
                // server can ack and return saved message with _id
                if (ack && ack.savedMessage) {
                    const saved = normalizeMessage(ack.savedMessage);
                    setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? saved : m)));
                } else {
                    // mark as delivered if server didn't return saved object
                    setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? { ...m, status: 'delivered' } : m)));
                }
            }
        );

        // notify session list preview
        setSessions((prev) => {
            return prev.map((s) =>
                s.sessionId === sessionId ? { ...s, lastMessage: text, lastMessageAt: new Date().toISOString() } : s
            );
        });
    }, []);

    // ---------- Send Typing (throttled) ----------
    const sendTyping = useCallback(
        throttle((sessionId) => {
            if (!socketRef.current || !sessionId) return;

            socketRef.current.emit('typing', {
                sessionId,
                senderType: 'admin'
            })
        }, 700), []
    );

    // ------ CLaim Session ------
    const claimSession = useCallback(async (sessionId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/chats/${encodeURIComponent(sessionId)}/claim`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();
            if (data && data.ok) {
                // update sessions
                setSessions((prev) => prev.map((s) => (s.sessionId === sessionId ? {...s, assignedStaff: data.session} : s)));
                return data.session;
            }

            return null;
        } catch (err) {
            console.error('claim session error: ', err);
            return null;
        }
    }, [])

    // ---------- MARK MESSAGES AS READ ----------
    const markAsRead = useCallback((sessionId) => {
        if (!socketRef.current) return;

        socketRef.current.emit('message:read', {
            sessionId,
            staffId: userRef.current ? userRef.current._id : null,
        });

        // optionally update locally
        setMessages((prev) => prev.map((m) => ({...m, status: 'seen'})));
    }, []);

    return {
        connected,
        socket: socketRef.current,
        sessions,
        messages,
        activeSessionId,
        incomingMessage,
        incomingSession,
        typingState,
        fetchSessions,
        connectToSession,
        sendMessage,
        sendTyping,
        claimSession,
        markAsRead,
    };
};