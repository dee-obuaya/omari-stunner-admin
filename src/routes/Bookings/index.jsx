/* eslint-disable no-unused-vars */
import React, {useEffect, useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import AddBookingModal from './AddBookingModal';
import EditBookingModal from './EditBookingModal';
import ImportBookingModal from './ImportBookingModal';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { SlPlus, SlPencil, SlTrash, SlDoc } from 'react-icons/sl';
import Alert from '../../components/Alert';
import ConfirmPopup from '../../components/ConfirmPopup';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [alert, setAlert] = useState({ type: '', message: '', visible: false });
    const [showAlert, setShowAlert] = useState(false);
    const formData = new FormData();

    const columns = [
        {
            title: 'Client',
            dataId: 'clientName',
            sort: true,
        },
        {
            title: 'Email',
            dataId: 'clientEmail',
        },
        {
            title: 'Phone Number',
            dataId: 'clientPhone',
        },
        {
            title: 'Service',
            dataId: 'clientService',
            render: (booking) => {
            // console.log(booking);
                return (
                    <span>{booking.row.original.clientService.service}</span>
                )
            }
        },
        {
            title: 'Appointment Date',
            dataId: 'appointmentDate',
            sort: true,
            render: (booking) => {
                const date = new Date(booking.row.original.appointmentDate);
                return (
                    <span>{date.toLocaleDateString()}</span>
                )
            }
        },
        {
            title: 'Appointment Time',
            dataId: 'appointmentTime',
        },
        {
            title: 'Appointment Address',
            dataId: 'appointmentAddress',
        },
        {
            title: 'Total People',
            dataId: 'totalPeople',
        },
        {
            title: 'Touchup Required',
            dataId: 'touchupRequired',
            // render: (booking) => {
            //     return (
            //         <span>{booking.row.original.touchUpRequired ? 'Yes' : 'No'}</span>
            //     )
            // }
        },
        {
            title: 'Down Payment',
            dataId: 'downPayment',
        },
        {
            title: 'Appointment Status',
            dataId: 'status',
            filter: ['All', 'Pending', 'Confirmed', 'Completed', 'Canceled', 'Moved'],
            render: (booking) => {
                return (
                    <div className={`badge badge-soft ${
                        booking.row.original.status === 'Pending' ? 'badge-warning' :
                        booking.row.original.status === 'Confirmed' ? 'badge-info' :
                        booking.row.original.status === 'Completed' ? 'badge-success' :
                        booking.row.original.status === 'Cancelled' ? 'badge-error' : 'badge-secondary'
                    } h-fit`}>
                        {booking.row.original.status}
                    </div>
                )
            }
        },
        {
            title: 'Payment Status',
            dataId: 'paymentStatus',
            filter: ['All', 'Not Paid', 'Partial', 'Pending Confirmation', 'Paid'],
            render: (booking) => {
                return (
                    <div className={`badge badge-soft ${
                        booking.row.original.paymentStatus === 'Not Paid' ? 'badge-error' :
                        booking.row.original.paymentStatus === 'Partial' ? 'badge-warning' :
                        booking.row.original.paymentStatus === 'Pending Confirmation' ? 'badge-info' :
                        booking.row.original.paymentStatus === 'Paid' ? 'badge-success' : 'badge-secondary'
                    } h-fit`}>
                        {booking.row.original.paymentStatus}
                    </div>
                )
            }
        },
        {
            title: 'Created At',
            dataId: 'created_at',
            render: (booking) => {
                const date = new Date(booking.row.original.created_at);
                return (
                    <span>{date.toLocaleDateString()}</span>
                )
            }
        },
        {
            title: 'Last Updated',
            dataId: 'updated_at',
            render: (booking) => {
                const date = new Date(booking.row.original.updated_at);
                return (
                    <span>{date.toLocaleDateString()}</span>
                )
            }
        },
        {
            title: 'Actions',
            dataId: 'actions',
            render: (booking) => {
            // console.log(booking);
                return (
                    <div className='flex space-x-4'>
                        <button
                            className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                            data-tip='Edit Service'
                            onClick={()=> handleEditClick(booking.row.original)}
                        >
                            <SlPencil className='text-lg' />
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
                            message={`Are you sure you want to delete ${booking.row.original.clientName}'s ${booking.row.original.clientService.service} appointment? This action cannot be undone.`}
                            confirmText='Yes, Delete'
                            cancelText='Cancel'
                            onConfirm={() => handleDeleteClick(booking.row.original)}
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
            getBookings();
            visibilityTimer = setTimeout(() => {
                setVisible(true);
            }, 500);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);


    const getBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/bookings');
            const data = await res.json();

            if (res.ok) {
                setBookings(data.bookings);
            } else {
                setAlert({ type: 'error', message: data.message || 'Failed to fetch bookings.' });
                setShowAlert(true);
            }

            // setTimeout(() => {
            //     console.log('bookings data: ', data);
            // }, 200);
            // else {
            //     setAlert({ type: 'error', message: data.message || 'Failed to fetch bookings.' });
            //     setShowAlert(true);
            // }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setAlert({ type: 'error', message: `Error: ${error.message}` });
            setShowAlert(true);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        };
    };

    const handleEditClick = (booking) => {
        setIsEditModalOpen(true);
        setSelectedBooking(booking);
        setTimeout(() => {
            document.getElementById('edit-booking-modal').showModal();
            // console.log('selected booking: ', booking);
        }, 200);
    };

    const handleCloseModal = () => {
        if (isAddModalOpen) {
            setIsAddModalOpen(false);
        } else if (isEditModalOpen) {
            setIsEditModalOpen(false);
            setSelectedBooking({});
        };
    };

    const handleDeleteClick = (booking) => {
        setSelectedBooking({...booking});
        setTimeout(() => {
            deleteBooking();
        }, 200);
    };

    const createBooking = async (data) => {
        // console.log('main: ', data);

        formData.append('booking', JSON.stringify(data.bookingInfo));

        // console.log('form data: ', formData.get('booking'));

        // console.log(typeof(formData.get('booking')));

        try {
            const res = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({booking: data.bookingInfo}),
            });

            const response = await res.json();

            if (!res.ok) {
                console.log('response: ', response);
                setAlert({ type: 'error', message: response.statusText || response.message || 'Failed to create booking.' });
                setShowAlert(true);
                return;
            };


            if (response.booking) {
                setAlert({type: 'success', message: response.message || `${response.booking.name}'s booking created successfully!`});
                setShowAlert(true);
            } else {
                setAlert({ type: 'error', message: response.message });
                setShowAlert(true);
            };

        } catch (error) {
            console.error('Error:', error);
            setAlert({type: 'error', message: `Error: ${error.message}`});
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            getBookings();
        };
    };

    const editBooking = async (data) => {
        formData.append('booking', JSON.stringify(data.bookingInfo));

        // console.log('form data: ', formData.get('booking'));

        // console.log(typeof(formData.get('booking')));

        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${selectedBooking._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({booking: data.bookingInfo}),
            });

            const response = await res.json();

            if (!res?.ok) {
                console.log('response: ', response);
                setAlert({ type: 'error', message: response.statusText || response.message || 'Failed to update booking.' });
                setShowAlert(true);
                return;
            };


            if (response?.booking) {
                setAlert({type: 'success', message: response.message || `${response.booking.name}'s booking update successfully!`});
                setShowAlert(true);
            } else {
                setAlert({ type: 'error', message: response.message });
                setShowAlert(true);
            };

        } catch (error) {
            console.error('Error:', error);
            setAlert({type: 'error', message: `Error: ${error.message}`});
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            getBookings();
        };
    };

    const deleteBooking = async () => {
        // console.log('deleting booking: ', selectedBooking._id);
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${selectedBooking._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setAlert({ type: 'error', message: data.message || 'Failed to delete booking.' });
                setShowAlert(true);
                return;
            } else {
                setAlert({ type: 'success', message: data.message });
                setShowAlert(true);
                getBookings();
            };

        } catch (error) {
            console.error('Error deleting service:', error);
            setAlert({ type: 'error', message: `Error: ${error}` });
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        };
    };

    return (
        loading ? (
            <Loader size='xl' />
        ) :
        (
            <>
                {showAlert && <Alert type={alert.type} message={alert.message} />}

                <AnimatePresence>
                    <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                        className={`transition-all ease-initial duration-700 ${visible ? 'opacity-100 mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14' : 'opacity-0'}`}
                    >
                        <div className='space-y-0.5 mb-4'>
                            <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest'>Bookings</h1>
                            <p className='text-base font-libertinus tracking-widest text-neutral-500'>Manage bookings</p>
                        </div>

                        <div className='divider mt-0 mb-4'></div>

                        <div className='flex justify-end mb-4'>
                            <div className='dropdown dropdown-end'>
                                <div tabIndex={0} role='button' className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'>
                                    <SlPlus className='text-sm' /> New Booking
                                </div>
                                <ul tabIndex='-1' className='dropdown-content menu bg-accent rounded-md z-5 w-52 p-2 shadow-sm'>
                                    <li className='text-accent-content hover:bg-base-300/20 hover:rounded-md'>
                                        <a
                                            onClick={()=>{
                                                setIsAddModalOpen(true);
                                                setTimeout(() => {
                                                    document.getElementById('add-booking-modal').showModal();
                                                }, 200);
                                            }}
                                        >
                                            Add Booking
                                        </a>
                                    </li>
                                    <li className='text-accent-content hover:bg-base-300/20 hover:rounded-md' onClick={()=>document.getElementById('import-booking-modal').showModal()}><a>Import Bookings</a></li>
                                </ul>
                            </div>
                            {/* <button
                                className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'
                                onClick={()=>document.getElementById('add-booking-modal').showModal()}
                            >
                            <SlPlus className='text-sm' /> New Booking
                            </button> */}
                        </div>

                        <Table
                            columns={columns}
                            dataSource={bookings}
                            pagination={{
                                totalItems: bookings?.length,
                            }}
                            tableKey='bookings'
                        />

                        {isAddModalOpen && <AddBookingModal submitNewBooking={createBooking} />}
                        {isEditModalOpen && <EditBookingModal booking={selectedBooking} submitUpdatedBooking={editBooking} handleClose={handleCloseModal}/>}

                    </motion.div>
                </AnimatePresence>
            </>
        )
    );
};

export default Bookings;