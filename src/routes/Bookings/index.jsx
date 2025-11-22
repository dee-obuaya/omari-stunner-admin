/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import AddBookingModal from './AddBookingModal';
import EditBookingModal from './EditBookingModal';
import ImportBookingModal from './ImportBookingModal';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { SlPlus, SlPencil, SlTrash, SlDoc } from 'react-icons/sl';
import {useAlert} from '../../contexts/AlertContext';
import ConfirmPopup from '../../components/ConfirmPopup';
import { API_BASE_URL, BOOKINGS_TABLE_KEY } from '../../constants/ServerUrl';
import { cat } from '@cloudinary/url-gen/qualifiers/focusOn';

const Bookings = () => {
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(false);
	const [visible, setVisible] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState(null);
    const {showAlert} = useAlert()
	const formData = new FormData();
    const [pagination, setPagination] = useState({ totalItems: 0, itemsPerPage: 10, currentPage: 1 });

    const loadState = () => {
        const savedState = sessionStorage.getItem(BOOKINGS_TABLE_KEY);

        if (!savedState) return { filters: {}, sortConfig: { key: null, direction: null } , page: 1 };

        try {
            const parsedState = JSON.parse(savedState);
            return {
                filters: parsedState.currentFilters || {},
                sortConfig: parsedState.currentSort || { key: null, direction: null },
                page: parsedState.currentPage || 1,
            };
        } catch (error) {
            console.error('Error parsing saved table state:', error);
            return { filters: {}, sortConfig: { key: null, direction: null }, page: 1 };
        }
    };

    const [{filters, sortConfig, page}, setTableState] = useState(loadState());

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
					<span className='badge badge-soft badge-success'>{booking.row.original.clientService.service}</span>
				);
			},
		},
		{
			title: 'Appointment Date',
			dataId: 'appointmentDate',
			sort: true,
			render: (booking) => {
				const date = new Date(booking.row.original.appointmentDate);
				return <span>{date.toLocaleDateString()}</span>;
			},
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
		},
		{
			title: 'Down Payment',
			dataId: 'downPayment',
		},
		{
			title: 'Appointment Status',
			dataId: 'status',
			filter: [
				'All',
				'Pending',
				'Confirmed',
				'Completed',
				'Cancelled',
				'Moved',
			],
			render: (booking) => {
				return (
					<div
						className={`badge badge-soft ${
							booking.row.original.status === 'Pending'
								? 'badge-warning'
								: booking.row.original.status === 'Confirmed'
								? 'badge-info'
								: booking.row.original.status === 'Completed'
								? 'badge-success'
								: booking.row.original.status === 'Cancelled'
								? 'badge-error'
								: 'badge-secondary'
						} h-fit`}>
						{booking.row.original.status}
					</div>
				);
			},
		},
		{
			title: 'Payment Status',
			dataId: 'paymentStatus',
			filter: [
				'All',
				'Not Paid',
				'Partial',
				'Pending Confirmation',
				'Paid',
			],
			render: (booking) => {
				return (
					<div
						className={`badge badge-soft ${
							booking.row.original.paymentStatus === 'Not Paid'
								? 'badge-error'
								: booking.row.original.paymentStatus ===
								  'Partial'
								? 'badge-warning'
								: booking.row.original.paymentStatus ===
								  'Pending Confirmation'
								? 'badge-info'
								: booking.row.original.paymentStatus === 'Paid'
								? 'badge-success'
								: 'badge-secondary'
						} h-fit`}>
						{booking.row.original.paymentStatus}
					</div>
				);
			},
		},
		{
			title: 'Created At',
			dataId: 'created_at',
			render: (booking) => {
				const date = new Date(booking.row.original.created_at);
				return <span>{date.toLocaleDateString()}</span>;
			},
		},
		{
			title: 'Last Updated',
			dataId: 'updated_at',
			render: (booking) => {
				const date = new Date(booking.row.original.updated_at);
				return <span>{date.toLocaleDateString()}</span>;
			},
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
							data-tip='Edit Booking'
							onClick={() =>
								handleEditClick(booking.row.original)
							}>
							<SlPencil className='text-lg' />
						</button>

						<ConfirmPopup
							trigger={
								<button
									className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
									data-tip='Delete Booking'>
									<SlTrash className='text-lg' />
								</button>
							}
							title='Delete Tab'
							message={`Are you sure you want to delete ${booking.row.original.clientName}'s ${booking.row.original.clientService.service} appointment? This action cannot be undone.`}
							confirmText='Yes, Delete'
							cancelText='Cancel'
							onConfirm={() =>
								handleDeleteClick(booking.row.original)
							}
							canCancel={true}
						/>
					</div>
				);
			},
		},
	];

	useEffect(() => {
		let visibilityTimer;
		const timer = setTimeout(() => {
			getBookings(page, sortConfig, filters);
			visibilityTimer = setTimeout(() => {
				setVisible(true);
			}, 500);
		}, 1000);

		return () => {
			clearTimeout(timer);
			clearTimeout(visibilityTimer);
		};
	}, []);

	const getBookings = async (page = pagination.currentPage, sort = {sortConfig}, filterValues = {filters}) => {
		setLoading(true);
		try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', pagination.itemsPerPage);

            if (sort.key && sort.direction) {
                params.set('sort', sort.key);
                params.set('order', sort.direction);
            };

            Object.entries(filterValues).forEach(([key, value]) => {
                if (value && value !== 'All') params.set(key, value);
            });

			const res = await fetch(`${API_BASE_URL}/api/bookings?${params}`, {credentials: 'include'});
			const data = await res.json();

			if (res.ok) {
				setBookings(data.bookings);
                setPagination(prev => ({
                    ...prev,
                    totalItems: data.pagination.totalItems,
                    currentPage: data.pagination.currentPage
                }));
			} else {
                console.error(data.message);
				showAlert({
					type: 'error',
					message: data.message || 'Failed to fetch bookings.',
				});
            }
		} catch (error) {
			console.error('Error fetching bookings:', error);
			showAlert({ type: 'error', message: `Error: ${error.message}` });
		} finally {
			setLoading(false);
		}
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
		}
	};

	const handleDeleteClick = (booking) => {
		setSelectedBooking({ ...booking });
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
			const res = await fetch(`${API_BASE_URL}/api/bookings`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ booking: data.bookingInfo }),
                credentials: 'include',
			});

			const response = await res.json();

			if (!res.ok) {
				console.log('response: ', response);
				showAlert({
					type: 'error',
					message:
						response.statusText ||
						response.message ||
						'Failed to create booking.',
				});
				return;
			}

			if (response.booking) {
				showAlert({
					type: 'success',
					message:
						response.message ||
						`${response.booking.name}'s booking created successfully!`,
				});
			} else {
				showAlert({ type: 'error', message: response.message });
			}
		} catch (error) {
			console.error('Error:', error);
			showAlert({ type: 'error', message: `Error: ${error.message}` });
		} finally {
			getBookings();
		}
	};

	const editBooking = async (data) => {
		formData.append('booking', JSON.stringify(data.bookingInfo));

		// console.log('form data: ', formData.get('booking'));

		// console.log(typeof(formData.get('booking')));

		try {
			const res = await fetch(
				`${API_BASE_URL}/api/bookings/${selectedBooking._id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ booking: data.bookingInfo }),
                    credentials: 'include',
				}
			);

			const response = await res.json();

			if (!res?.ok) {
				console.log('response: ', response);
				showAlert({
					type: 'error',
					message:
						response.statusText ||
						response.message ||
						'Failed to update booking.',
				});
				return;
			}

			if (response?.booking) {
				showAlert({
					type: 'success',
					message:
						response.message ||
						`${response.booking.name}'s booking updated successfully!`,
				});
			} else {
				showAlert({ type: 'error', message: response.message });
			}
		} catch (error) {
			console.error('Error:', error);
			showAlert({ type: 'error', message: `Error: ${error.message}` });
		} finally {
			getBookings();
		}
	};

	const deleteBooking = async () => {
		// console.log('deleting booking: ', selectedBooking._id);
		try {
			const response = await fetch(
				`${API_BASE_URL}/api/bookings/${selectedBooking._id}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
                    credentials: 'include',
				}
			);

			const data = await response.json();

			if (!response.ok) {
				showAlert({
					type: 'error',
					message: data.message || 'Failed to delete booking.',
				});
				return;
			} else {
				showAlert({ type: 'success', message: data.message });
				getBookings();
			}
		} catch (error) {
			console.error('Error deleting booking:', error);
			showAlert({ type: 'error', message: `Error: ${error}` });
		}
	};

	return loading ? (
		<Loader size='xl' />
	) : (
		<>

			<div
				className={`transition-all ease-initial duration-700 ${
					visible
						? 'opacity-100 mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14'
						: 'opacity-0'
				}`}>
				<div className='space-y-0.5 mb-4'>
					<h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest'>
						Bookings
					</h1>
					<p className='text-base font-libertinus tracking-widest text-neutral-500'>
						Manage bookings
					</p>
				</div>

				<div className='divider mt-0 mb-4'></div>

				<div className='flex justify-end mb-4'>
					<div className='dropdown dropdown-end'>
						<motion.div
                            initial={{scale: 0.9}}
                            whileHover={{scale: 1}}
                            whileTap={{scale: 0.85}}
                            transition={{duration: 0.4, delay: 0.25, ease: [0, 0.71, 0.2, 1.01],}}
							tabIndex={0}
							role='button'
							className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'>
							<SlPlus className='text-sm' /> New Booking
						</motion.div>
						<ul
							tabIndex='-1'
							className='dropdown-content menu bg-accent rounded-md z-5 w-52 p-2 shadow-sm'>
							<li className='text-accent-content hover:bg-base-300/20 hover:rounded-md'>
								<a
									onClick={() => {
										setIsAddModalOpen(true);
										setTimeout(() => {
											document
												.getElementById(
													'add-booking-modal'
												)
												.showModal();
										}, 200);
									}}>
									Add Booking
								</a>
							</li>
							<li
								className='text-accent-content hover:bg-base-300/20 hover:rounded-md'
								onClick={() =>
									document
										.getElementById('import-booking-modal')
										.showModal()
								}>
								<a>Import Bookings</a>
							</li>
						</ul>
					</div>
				</div>

				<Table
					columns={columns}
					dataSource={bookings}
					pagination={pagination}
                    loading={loading}
                    currentSort={sortConfig}
                    currentFilters={filters}
                    currentPage={pagination.currentPage}
                    onSortChange={(newSort) => {
                        setTableState(prev => ({...prev, sortConfig: newSort, page: 1}));
                        sessionStorage.setItem(BOOKINGS_TABLE_KEY, JSON.stringify({currentFilters: filters, currentSort: newSort, currentPage: 1}));
                        getBookings(1, newSort, filters);
                    }}
                    onFilterChange={(newFilters) => {
                        setTableState(prev => ({...prev, filters: newFilters,  page: 1}));
                        sessionStorage.setItem(BOOKINGS_TABLE_KEY, JSON.stringify({currentFilters: newFilters, currentSort: sortConfig, currentPage: 1}));
                        getBookings(1, sortConfig, newFilters);
                    }}
                    onPageChange={(newPage) => {
                        setTableState(prev => ({...prev, page: newPage}));
                        sessionStorage.setItem(BOOKINGS_TABLE_KEY, JSON.stringify({currentFilters: filters, currentSort: sortConfig, currentPage: newPage}));
                        getBookings(newPage, sortConfig, filters)
                    }}
				/>

				{isAddModalOpen && (
					<AddBookingModal submitNewBooking={createBooking} handleClose={handleCloseModal} />
				)}
				{isEditModalOpen && (
					<EditBookingModal
						booking={selectedBooking}
						submitUpdatedBooking={editBooking}
						handleClose={handleCloseModal}
					/>
				)}
			</div>
		</>
	);
};

export default Bookings;
