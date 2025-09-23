import React from 'react';
import AddBookingModal from './AddBookingModal';
import EditBookingModal from './EditBookingModal';
import ImportBookingModal from './ImportBookingModal';

const Bookings = () => {
    return (
        <div className='p-4'>
            <h1 className='text-2xl font-bold mb-4'>Bookings Page</h1>
            <p>This is the Bookings page. Here you can manage and view bookings.</p>
        </div>
    );
};

export default Bookings;