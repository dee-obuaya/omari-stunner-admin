/* eslint-disable no-unused-vars */
/* ChatBox.jsx */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import useDeviceType from '../../hooks/useDeviceType';

export default function ChatBox({ messages = [], onSend, isTyping, activeChat, onBack }) {
    const bottomRef = useRef(null);
    const messagesRef = useRef(null);
    const [text, setText] = useState('');
    const { deviceType } = useDeviceType();

    useEffect(() => {
        // small delay so scroll happens after layout settles
        const t = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 60);
        return () => clearTimeout(t);
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!text.trim()) return;
        onSend(text.trim());
        setText('');
        // ensure scroll after optimistic add
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 60);
    };

    const groupByDate = (msgs) => {
        const map = {};
        msgs.forEach((m) => {
        const date = new Date(m.createdAt || Date.now()).toLocaleDateString([], {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        if (!map[date]) map[date] = [];
        map[date].push(m);
        });
        return Object.entries(map);
    };

    return (
        <div className={`flex flex-col h-full overflow-hidden
            ${deviceType === 'mobile' ? 'rounded-md' : 'rounded-e-md'}`}
        >
            {/* header - fixed height */}
            <header className={`flex items-center gap-3 h-14 px-3 border-b bg-primary/50 shrink-0 z-10 ${onBack ? '' : 'justify-center'}`}>
                {onBack && <button onClick={onBack} className='md:hidden btn btn-ghost p-2'>
                    <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='24' height='24' viewBox='0 0 24 24'
                            fill='none' stroke='currentColor' strokeWidth='2'
                            strokeLinecap='round' strokeLinejoin='round'
                            className='lucide lucide-arrow-left-icon lucide-arrow-left'
                        >
                            <path d='m12 19-7-7 7-7'/><path d='M19 12H5'/>
                    </svg>
                </button>}
                <div className={`font-semibold font-libertinus tracking-wider text-lg`}>
                    {activeChat?.name || 'Visitor'}
                </div>
            </header>

            {/* messages area - ONLY this scrolls */}
            <div ref={messagesRef} className='flex-1 overflow-y-auto px-4 bg-neutral/55'>
                {messages.length === 0 && <div className='text-center text-sm text-gray-500 py-6'>No messages</div>}

                {groupByDate(messages).map(([date, msgs]) => (
                <div key={date} className='space-y-4'>
                    <div className='text-center text-xs text-gray-400 my-2'>
                        {date}
                    </div>
                    {msgs.map((m) => {
                        const isAdmin = m.senderType === 'admin';
                        return (
                            <motion.div
                                key={m._id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className={`chat ${isAdmin ? 'chat-end' : 'chat-start'}`}>
                                    <div className='chat-bubble text-neutral-content'>
                                        {m.message || m.content}
                                    </div>
                                    <div className='chat-footer opacity-50'>
                                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isAdmin && <span className='ml-2 text-warning'>{m.status === 'seen' ? 'Seen' : m.status === 'delivered' ? 'Delivered' : 'Sent'}</span>}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                ))}

                {isTyping && <div className='text-sm text-gray-500 py-2'>Typing…</div>}

                <div ref={bottomRef} />
            </div>

            {/* input - fixed at bottom */}
            <div className='shrink-0 p-2.5 border-t bg-neutral/30 backdrop-blur-lg'>
                <div className='flex items-center gap-2'>
                    <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className='input md:w-full flex-1'
                        placeholder='Type a message...'
                    />
                    <motion.button
                        onClick={handleSend}
                        className='btn btn-info btn-circle'
                        whileHover={{ scale: 1.05 }}
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='24' height='24' viewBox='0 0 24 24'
                            fill='none' stroke='currentColor'
                            strokeWidth='2' strokeLinecap='round'
                            strokeLinejoin='round'
                            className='lucide lucide-arrow-up-icon lucide-arrow-up'
                        >
                            <path d='m5 12 7-7 7 7'/><path d='M12 19V5'/>
                        </svg>
                    </motion.button>
                </div>
            </div>
        </div>
  );
}
