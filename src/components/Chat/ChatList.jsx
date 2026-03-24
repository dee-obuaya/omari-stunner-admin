/* eslint-disable no-unused-vars */
import { motion } from 'motion/react';
import useDeviceType from '../../hooks/useDeviceType';

export default function ChatList ({ chats = [], activeChatId, onSelect }) {
    if (!Array.isArray(chats)) chats = [];
    const { deviceType } = useDeviceType();

    return (
        <aside
            className={`w-full h-full shrink-0 backdrop-blur-xl shadow-sm overflow-y-hidden
                ${deviceType === 'mobile' ? 'rounded-md' : 'rounded-s-md'}`}
        >
            <div className='z-10 h-14 px-4 flex items-center border-b font-semibold font-libertinus bg-primary/50 tracking-wider text-lg text-base-content'>
                Conversations
            </div>

            <div className='space-y-1 px-2 py-4 h-full overflow-y-auto bg-neutral/55'>
                {chats.length === 0 && (
                    <div className='text-center text-sm text-base-content/60 py-6'>
                        No conversations yet
                    </div>
                )}

                {chats.map((chat) => {
                    const chatId = chat.sessionId;
                    const isActive = activeChatId === chatId;

                    return (
                        <motion.div
                            key={chatId}
                            onClick={() => onSelect(chat)}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.15 }}
                            className={
                                `border-4 border-base-100/20 p-3 rounded-xl cursor-pointer select-none transition-all duration-200 ${isActive ? 'bg-neutral/45 text-neutral-content' : 'hover:bg-neutral/20'}`
                            }
                        >
                            <div className='flex justify-between items-center'>
                                <div className='font-medium'>
                                    {chat.name || 'Visitor'}
                                </div>

                                <div className='text-xs opacity-60'>
                                    {chat.lastMessageAt ?
                                        new Date(chat.lastMessageAt).toDateString() : ''
                                    }

                                    <br/>
                                    <p className='text-end'>
                                        {chat.lastMessageAt ?
                                            new Date(chat.lastMessageAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : ''
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className='text-sm opacity-70 line-clamp-1'>
                                {chat.lastMessage || 'Start the conversation'}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </aside>
    )
}