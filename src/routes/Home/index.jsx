/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Loader from '../../components/Loader';
import LineChartTrend from '../../components/LineChartTrend';
import BarChartTrend from '../../components/BarChartTrend';
import {useAuth} from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../constants/ServerUrl';

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [visible, setVisible] = useState(false);
	const [groupedBookings, setGroupedBookings] = useState([]);
    const [bookedServices, setBookedServices] = useState([]);
    const [statistics, setStatistics] = useState({})
    const {user} = useAuth();

	useEffect(() => {
		let visibilityTimer;
		const timer = setTimeout(() => {
			getBookingsData();
            getBookedServiceData();
            getStatistics();
			visibilityTimer = setTimeout(() => {
				setVisible(true);
			}, 500);
		}, 1000);
		return () => {
			clearTimeout(timer);
			clearTimeout(visibilityTimer);
		};
	}, []);

	const getBookingsData = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/api/dashboard/bookingsPerMonth`, {credentials: 'include'});
			const response = await res.json();

			if (res.ok) {
                // console.log(response.data);
				setGroupedBookings(response.data);
			}
		} catch (error) {
			console.error('Error fetching bookings:', error);
		} finally {
			setLoading(false);
		}
	};

    const getBookedServiceData = async () => {
        setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/api/dashboard/bookedServiceCount`, {credentials: 'include'});
			const response = await res.json();

			if (res.ok) {
                // console.log(response.data);
				setBookedServices(response.data);
			}
		} catch (error) {
			console.error('Error fetching booked service count:', error);
		} finally {
			setLoading(false);
		}
    };

    const getStatistics = async () => {
        setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/api/dashboard/statistics`, {credentials: 'include'});
			const response = await res.json();

			if (res.ok) {
                // console.log(response.data);
				setStatistics(response.data);
			}
		} catch (error) {
			console.error('Error fetching statistics', error);
		} finally {
			setLoading(false);
		}
    };

	return (
		loading ? (
            <Loader size='xl' />
        ) :
        (
            <>
                <motion.div
                    className={`h-full flex flex-col content-center transition-all ease-initial duration-700 ${visible ? 'mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14 space-y-5' : ''}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <div>
                        <p className='font-italiana font-extralight text-2xl tracking-widest'>Welcome Back, {user.name}</p>
                    </div>

                    <div className='px-8 md:p-4'>
                        <div className='stats stats-vertical shadow-md md:stats-horizontal w-full bg-base-300/20 text-base-content font-libertinus tracking-wider overflow-hidden'>
                            <div
                                className='stat w-full md:w-auto'
                                onMouseEnter={() => {
                                    const bookingsBreakdown = document.querySelector('.bookings-breakdown');

                                    bookingsBreakdown.classList.toggle('hidden');
                                }}
                                onMouseLeave={() => {
                                    const bookingsBreakdown = document.querySelector('.bookings-breakdown');

                                    bookingsBreakdown.classList.toggle('hidden');
                                }}
                            >
                                <div className='stat-figure text-info'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='36' height='36'
                                        viewBox='0 0 24 24'fill='none'
                                        stroke='currentColor' strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='lucide lucide-book-check-icon lucide-book-check'
                                    >
                                        <path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20'/>
                                        <path d='m9 9.5 2 2 4-4'/>
                                    </svg>
                                </div>

                                <div>
                                    <div className='stat-title text-lg md:text-xl inline-flex items-center gap-x-3 md:gap-x-0 lg:gap-x-3'>
                                        <span>
                                            <div className='stat-value text-3xl text-base-content inline-flex md:hidden lg:inline-flex'>{statistics.totalBookings}</div>
                                        </span>
                                        Total Bookings
                                    </div>
                                    <div className='stat-value text-3xl text-base-content hidden md:block lg:hidden'>{statistics.totalBookings}</div>
                                    <div className='stat-desc transition-discrete duration-200 ease-in-out bookings-breakdown hidden space-x-2.5'>
                                        <div className='inline-flex items-center gap-x-0.5'>
                                            <span>
                                                <div className='inline-flex'>{statistics.completedBookings}</div>
                                            </span>
                                            Completed Bookings
                                        </div>
                                        <div className='inline-flex items-center gap-x-0.5'>
                                            <span>
                                                <div className='inline-flex'>{statistics.pendingBookings}</div>
                                            </span>
                                            Pending Bookings
                                        </div>
                                        <div className='inline-flex items-center gap-x-0.5'>
                                            <span>
                                                <div className='inline-flex'>{statistics.cancelledBookings}</div>
                                            </span>
                                            Cancelled Bookings
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='stat w-full md:w-auto'>
                                <div className='stat-figure text-info'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='36' height='36'
                                        viewBox='0 0 24 24' fill='none'
                                        stroke='currentColor' strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='lucide lucide-hand-heart-icon lucide-hand-heart'
                                    >
                                        <path d='M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16'/>
                                        <path d='m14.45 13.39 5.05-4.694C20.196 8 21 6.85 21 5.75a2.75 2.75 0 0 0-4.797-1.837.276.276 0 0 1-.406 0A2.75 2.75 0 0 0 11 5.75c0 1.2.802 2.248 1.5 2.946L16 11.95'/>
                                        <path d='m2 15 6 6'/>
                                        <path d='m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a1 1 0 0 0-2.75-2.91'/>
                                    </svg>
                                </div>
                                <div className='stat-title text-lg md:text-xl inline-flex items-center gap-x-3 md:gap-x-0 lg:gap-x-3'>
                                    <span>
                                        <div className='stat-value text-3xl text-base-content inline-flex md:hidden lg:inline-flex'>{statistics.totalServices}</div>
                                    </span>
                                    Total Services
                                </div>
                                <div className='stat-value text-3xl text-base-content hidden md:block lg:hidden'>{statistics.totalServices}</div>
                            </div>

                            <div className='stat w-full md:w-auto'>
                                <div className='stat-figure text-info'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='36' height='36'
                                        viewBox='0 0 24 24' fill='none'
                                        stroke='currentColor' strokeWidth='2'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        className='lucide lucide-image-icon lucide-image'
                                    >
                                        <rect width='18' height='18' x='3' y='3' rx='2' ry='2'/>
                                        <circle cx='9' cy='9' r='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/>
                                    </svg>
                                </div>
                                <div className='stat-title text-lg md:text-xl inline-flex md:block lg:inline-flex items-center gap-x-3 md:gap-x-0 lg:gap-x-3'>
                                    <span>
                                        <div className='stat-value text-3xl text-base-content inline-flex md:hidden lg:inline-flex'>{statistics.totalImages}</div>
                                    </span>
                                    Total Images
                                </div>
                                <div className='stat-value text-3xl text-base-content hidden md:block lg:hidden'>{statistics.totalImages}</div>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-4 md:space-y-12 lg:space-y-0 lg:flex lg:gap-8'>
                        <div className='shadow-md lg:w-1/2 rounded-box h-fit'>
                            <LineChartTrend title={`Booking Trend ${new Date().getFullYear()}`} data={groupedBookings} />
                        </div>

                        <div className='shadow-md lg:w-1/2 rounded-box h-fit'>
                            <BarChartTrend title={`Booked Services Trend`} data={bookedServices} />
                        </div>
                    </div>
                </motion.div>
            </>
        )
	);
}
