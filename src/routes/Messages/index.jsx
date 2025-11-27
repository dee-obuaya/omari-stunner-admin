/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { SlEnvolope, SlTrash } from 'react-icons/sl';
import { useAlert } from '../../contexts/AlertContext';
import ConfirmPopup from '../../components/ConfirmPopup';
import { API_BASE_URL, MESSAGES_TABLE_KEY } from '../../constants/ServerUrl';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const { showAlert } = useAlert();
    const [pagination, setPagination] = useState({ totalItems: 0, itemsPerPage: 10, currentPage: 1 });

    const loadState = () => {
        const savedState = sessionStorage.getItem(MESSAGES_TABLE_KEY);

        if (!savedState) return { filters: {}, sortConfig: { key: null, direction: null }, page: 1 };

        try {
            const parsedState = JSON.parse(savedState);
            return {
                filters: parsedState.currentFilters || {},
                sortConfig: parsedState.currentSort || { key: null, direction: null },
                page: parsedState.currentPage || 1
            };
        } catch (error) {
            console.error('Error parsing saved table state:', error);
            return { filters: {}, sortConfig: { key: null, direction: null }, page: 1 };
        }
    };

    const [{filters, sortConfig, page}, setTableState] = useState(loadState());

    const columns = [
        {
            title: 'Name',
            dataId: 'name',
            sort: true
        },
        {
            title: 'Email',
            dataId: 'email',
        },
        {
            title: 'Phone Number',
            dataId: 'phone',
        },
        {
            title: 'Message',
            dataId: 'body',
            render: (msg) => (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    // style={{ maxWidth: '200px', wordWrap: 'break-word' }}
                    className='max-w-64 text-start text-wrap mx-auto'
                >
                    {msg.row?.original?.body}
                </motion.div>
            )
        },
        {
            title: 'Date Received',
            dataId: 'createdAt',
            sort: true,
            render: (msg) => {
                const date = new Date(msg?.row?.original?.createdAt);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        },
        {
            title: 'Actions',
            dataId: 'actions',
            render: (msg) => {
                return (
                    <div className='flex space-x-4 justify-center'>
                        <button
                            className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                            data-tip='Send message to email'
                            onClick={()=> handleSend(msg?.row?.original)}
                        >
                            <SlEnvolope className='text-lg' />
                        </button>

                        <ConfirmPopup
                            trigger={
                                <button
                                    className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                                    data-tip='Delete Service'
                                >
                                    <SlTrash className='text-lg' />
                                </button>
                            }
                            title='Delete Tab'
                            message={`Are you sure you want to delete this message? This action cannot be undone.`}
                            confirmText='Yes, Delete'
                            cancelText='Cancel'
                            onConfirm={() => handleDeleteClick(msg?.row?.original)}
                            canCancel={true}
                        />
                    </div>
                )
            }
        }
    ];

    useEffect(() => {
        let visibilityTimer;

        const timer = setTimeout(() => {
            getMessages(page, sortConfig, filters);

            visibilityTimer = setTimeout(() => setVisible(true), 500);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    const getMessages = async (page=pagination?.currentPage, sort=sortConfig, filterValues=filters) => {
        setLoading(true);

        try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', pagination?.itemsPerPage);

            if (sort?.key && sort?.direction) {
                params.set('sort', sort.key);
                params.set('order', sort.direction);
            };

            Object.entries(filterValues).forEach(([key, value]) => {
                if ( value && value !== 'All' && value !== '') params.set(key, value);
            });

            const res = await fetch(`${API_BASE_URL}/api/messages?${params}`, {credentials: 'include'});
            const data = await res.json();

            console.log(data);

            if (res.ok) {
                setMessages(data?.messages);
                setPagination((prev) => ({
                    ...prev,
                    totalItems: data?.pagination.totalItems,
                    currentPage: data?.pagination.currentPage
                }));
            } else {
                showAlert({message: data?.message, type: 'error'});
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            showAlert({message: 'Failed to fetch messages. Please try again later.', type: 'error'});
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (message) => {};

    const handleDeleteClick = (message) => {
        setSelectedMessage({...message});
        setTimeout(() => {
            deleteMessage();
        }, 200);
    };

    const deleteMessage = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/messages/${selectedMessage._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            const data = await res.json();

            if (!res.ok) {
                showAlert({message: data.message, type: 'error'});
                return;
            }

            showAlert({message: 'Message deleted successfully', type: 'success'});
            getMessages();
        } catch (error) {
            console.error('Error deleting message:', error);
            showAlert({message: 'Failed to delete message. Please try again later.', type: 'error'});
        }
    }

    if (loading) {
        return <Loader size='xl' tip='Just a moment...' />;
    };

    return (
        <motion.div
            className={`transition-all ease-initial duration-700 ${visible ? 'mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
        >
            <div className='space-y-0.5 mb-4'>
                <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest'>Messages</h1>
                <p className='text-base font-libertinus tracking-widest text-neutral-500'>View, manage, and act on messages received</p>
            </div>

            <div className='divider mt-0 mb-4'></div>

            <Table
                columns={columns}
                dataSource={messages}
                pagination={pagination}
                loading={loading}
                currentSort={sortConfig}
                currentFilters={filters}
                currentPage={pagination.currentPage}
                onSortChange={(newSort) => {
                    setTableState(prev => ({...prev, sortConfig: newSort, page: 1}));
                    sessionStorage.setItem(MESSAGES_TABLE_KEY, JSON.stringify({currentFilters: filters, currentSort: newSort, currentPage: 1}));
                    getMessages(1, newSort, filters);
                }}
                onFilterChange={(newFilters) => {
                    setTableState(prev => ({...prev, filters: newFilters,  page: 1}));
                    sessionStorage.setItem(MESSAGES_TABLE_KEY, JSON.stringify({currentFilters: newFilters, currentSort: sortConfig, currentPage: 1}));
                    getMessages(1, sortConfig, newFilters);
                }}
                onPageChange={(newPage) => {
                    setTableState(prev => ({...prev, page: newPage}));
                    sessionStorage.setItem(MESSAGES_TABLE_KEY, JSON.stringify({currentFilters: filters, currentSort: sortConfig, currentPage: newPage}));
                    getMessages(newPage, sortConfig, filters)
                }}
            />
        </motion.div>
    )
};

export default Messages;