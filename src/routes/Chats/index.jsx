/* eslint-disable no-unused-vars */
/* Chat/index.jsx */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import ChatList from '../../components/Chat/ChatList';
import ChatBox from '../../components/Chat/ChatBox';
import useAdminChatSocket from '../../hooks/useAdminChatSocket';
import Loader from '../../components/Loader';
import useDeviceType from '../../hooks/useDeviceType';
import { API_BASE_URL } from '../../constants/ServerUrl';

export default function Chat() {
    const { sessions, setSessions, messages, joinSession, markSeen } = useAdminChatSocket();
    const { deviceType } = useDeviceType();
    const [activeChat, setActiveChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let visibilityTimer;
        const timer = setTimeout(() => {
            setLoading(false);
            visibilityTimer = setTimeout(() => setVisible(true), 500);
        }, 1000);
        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/chats/admin/chat-sessions`, {
                    credentials: 'include'
                });

                const data = await res.json();

                console.log('📦 Sessions from API:', data.sessions);

                if (data.ok) {

                    setSessions(prev => {
                        const existingIds = new Set(prev.map(s => s.sessionId));

                        const newSessions = data.sessions
                            .filter(s => !existingIds.has(s.sessionId));

                        return [...prev, ...newSessions]
                    });
                    // setSessions(prev => {
                    //     const existingIds = new Set(prev.map(s => normalizedId(s._id)));

                    //     const newSessions = data.sessions
                    //         .map(s => ({ ...s, _id: normalizedId(s._id) }))
                    //         .filter(s => !existingIds.has(s._id));

                    //     return [...prev, ...newSessions];
                    // });

                    setTimeout(() => console.log('Set sessions: ', sessions))
                }
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
            }
        };

        fetchSessions();
    }, []);

    const activeSessionId = activeChat?.sessionId;

    const filteredMessages = messages.filter(
        msg => msg.sessionId === activeSessionId
    );

    const handleSelectChat = (chat) => {
        console.log('🟡 Chat selected:', chat);

        setTimeout(() => {
            setActiveChat(chat);
        }, 50);

        // const sessionId = chat._id;
        const sessionId = chat.sessionId;

        if (sessionId) {
            joinSession(sessionId);

            // wait for history before marking seen
            setTimeout(() => {
                markSeen(sessionId);
            }, 500);
        }
    };

    const handleSend = (text) => {
        console.log('Sending messages not implemented yet');
    };

    const handleBack = () => setActiveChat(null);

    if (loading) return <Loader size="xl" />;

    /* IMPORTANT NOTES:
        - outer container: `h-[calc(100vh-5rem)]` gives exact available height (subtract your app header height).
        - stableWrap is a non-animated block so children transforms don't get reflowed by parent motion.
    */
    return (
        <motion.div
            className={`transition-all ease-initial duration-700
                ${visible ?
                    'mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14' : ''
                }
                ${deviceType === 'mobile' ?
                    'h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]' :
                    'h-8/12 max-h-180'
                }
            `}
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
        >
            {/* STABLE WRAPPER: critical to prevent jump */}
            <div className='relative md:static overflow-y-clip w-full md:flex h-full'>
                <motion.div
                    initial={deviceType === 'mobile' ? { x: 0 } : {}}
                    animate={deviceType === 'mobile' ? {x: activeChat ? '-100vw' : 0} : {}}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className={`
                        absolute md:static w-full md:w-1/3 shrink-0
                        ${deviceType === 'mobile' ?
                            'h-9/12' : 'h-full border-r'
                        }
                    `}
                >
                    <ChatList
                        chats={sessions}
                        activeChatId={activeChat?.sessionId}
                        onSelect={handleSelectChat}
                    />
                </motion.div>

                {activeChat && (
                    <motion.div
                        initial={deviceType === 'mobile' ? { x: '-100vw' } : {}}
                        animate={deviceType === 'mobile' ? {x: activeChat ? 0 : '100vw'} : {}}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className={`
                            absolute md:static w-full md:w-2/3 shrink-0 bg-base-100
                            ${deviceType === 'mobile' ?
                                'h-9/12': 'h-full'
                            }
                        `}
                    >
                        <ChatBox
                            // chatId={activeChat.sessionId}
                            chatId={activeSessionId}
                            activeChat={activeChat}
                            messages={filteredMessages}
                            onSend={handleSend}
                            onBack={deviceType === 'mobile' ? handleBack : undefined}
                        />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
