/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import 'cally';

const AddBookingModal = ({submitNewBooking, handleClose}) => {
    const [bookingInfo, setBookingInfo] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientService: '',
        appointmentDate: `${new Date().toISOString().split('T')[0]}`,
        appointmentTime: '00:00',
        appointmentAddress: '',
        totalPeople: 1,
        touchupRequired: 'No',
        downPayment: 'None',
        status: 'Pending',
        paymentStatus: 'Not Paid'
    });
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        let timer;

        timer = setTimeout(() => {
            getServices();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const resetForm = () => {
        setBookingInfo({...bookingInfo,
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            clientService: '',
            appointmentDate: `${new Date().toISOString().split('T')[0]}`,
            appointmentTime: '00:00',
            appointmentAddress: '',
            totalPeople: 1,
            touchUpRequired: 'no',
            downPayment: 'None',
            status: 'Pending',
            paymentStatus: 'Not Paid'
        });
    };

    const getServices = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/services');

            if (res.ok) {
                const data = await res.json();
                // console.log('Services data:', data);
                setServices(data);
            } else {
                console.log('No services');
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        if (name === 'booking[clientName]') setBookingInfo({...bookingInfo, clientName: value });
        if (name === 'booking[clientEmail]') setBookingInfo({...bookingInfo, clientEmail: value });
        if (name === 'booking[clientPhone]') setBookingInfo({...bookingInfo, clientPhone: value });
        if (name === 'booking[clientService]') setBookingInfo({...bookingInfo, clientService: value });
        if (name === 'booking[appointmentDate]') setBookingInfo({...bookingInfo, appointmentDate: value });
        if (name === 'booking[appointmentTime]') setBookingInfo({...bookingInfo, appointmentTime: value });
        if (name === 'booking[appointmentAddress]') setBookingInfo({...bookingInfo, appointmentAddress: value });
        if (name === 'booking[totalPeople]') setBookingInfo({...bookingInfo, totalPeople: value });
        if (name === 'booking[touchupRequired]') setBookingInfo({...bookingInfo, touchupRequired: value });
        if (name === 'booking[downPayment]') setBookingInfo({...bookingInfo, downPayment: value });

        setTimeout(() => {
            console.log(bookingInfo.touchUpRequired);
        }, 200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // console.log(typeof(bookingInfo));
        submitNewBooking({bookingInfo});

        closeModal();
    };

    const closeModal = () => {
        resetForm();

        document.getElementById('add-booking-modal').close();

        handleClose();
    };

    return (
        <dialog id='add-booking-modal' className='modal' onClose={closeModal}>
            <div className='modal-box lg:max-w-3xl'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form id='form' className='my-4 px-4 md:px-8 lg:px-0 lg:mx-auto font-libertinus tracking-widest' onSubmit={handleSubmit}>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <fieldset className='fieldset lg:max-w-3/4 md:mx-auto lg:px-10'>
                        <legend className='fieldset-legend text-base'>Name</legend>
                        <input type='text' name='booking[clientName]' value={`${bookingInfo.clientName}`} onChange={handleChange} className='input validator w-full' placeholder='Name' required title='Only letters' />
                        <div className="validator-hint">Please enter name</div>

                        <legend className='fieldset-legend text-base'>Email</legend>
                        <input type='email' name='booking[clientEmail]' value={`${bookingInfo.clientEmail}`} onChange={handleChange} className='input validator w-full' placeholder='Email' required title='Please enter a valid email address' />
                        <div className='validator-hint'>Please enter email </div>

                        <legend className='fieldset-legend text-base'>Phone Number</legend>
                        <input type='number' name='booking[clientPhone]' value={`${bookingInfo.clientPhone}`} onChange={handleChange} className='input validator w-full' placeholder='Phone Number' required title='Please enter a valid phone number' />
                        <div className='validator-hint'>Please enter phone number</div>

                        <legend className='fieldset-legend'>Service</legend>
                        <select name='booking[clientService]' defaultValue='Pick a service' className='select validator w-full' onChange={handleChange} required>
                            <option disabled={true}>Pick a service</option>
                            {services.map((svc, index) => {
                                return <option key={index}>{svc.service}</option>
                            })}
                        </select>
                        <div className='validator-hint'>Please choose a service</div>

                        <legend className='fieldset-legend text-base'>Appointment Date</legend>
                        <input name='booking[appointmentDate]' value={bookingInfo.appointmentDate} popoverTarget="cally-popover1" className="button input validator w-full" id="cally1" style={{anchorName: '--cally1'}} onClick={() => setShowCalendar(true)} onChange={handleChange}/>
                        {showCalendar && (
                            <div>
                                <div
                                    onClick={() => setShowCalendar(false)}
                                    className='btn btn-sm btn-circle btn-ghost flex justify-self-end'
                                >
                                    X
                                </div>
                                <calendar-date class="cally" onchange={(e) => {
                                    document.getElementById('cally1').innerText = e.target.value
                                    const selectedDate = e.target.value;
                                    // console.log('Selected date:', selectedDate);
                                    setBookingInfo({...bookingInfo, appointmentDate: selectedDate});
                                }}>
                                    <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 19.5 8.25 12l7.5-7.5"></path></svg>
                                    <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
                                    <calendar-month></calendar-month>
                                </calendar-date>
                            </div>
                        )}
                        <div className='validator-hint'>Please choose a date</div>

                        <legend className='fieldset-legend text-base'>Appointment Time</legend>
                        <input type='time' name='booking[appointmentTime]' value={`${bookingInfo.appointmentTime}`} onChange={handleChange} className='input validator w-full' placeholder='Appointment Time' required title='Please enter a valid time' />
                        <div className='validator-hint'>Please choose a time</div>

                        <legend className='fieldset-legend text-base'>Appointment Address</legend>
                        <input type='text' name='booking[appointmentAddress]' value={`${bookingInfo.appointmentAddress}`} onChange={handleChange} className='input validator w-full' placeholder='Appointment Address' required={bookingInfo.clientService === 'Studio Walk-in' && false} title='Please enter an address' disabled={bookingInfo.clientService === 'Studio Walk-in' && true} />
                        <div className='validator-hint'>Please enter an address</div>

                        <legend className='fieldset-legend text-base'>Total People</legend>
                        <input type='number' name='booking[totalPeople]' value={`${bookingInfo.totalPeople}`} onChange={handleChange} className='input validator w-full' placeholder='Number of people booking for' required title='Please enter a valid number' />
                        <div className='validator-hint'>Please enter a valid number</div>

                        <legend className='fieldset-legend text-base'>
                            Touchup?
                            <span className='text-sm text-neutral-500/30 tracking-wide'>(Would our artist be required to stay back for touchups?)</span>
                        </legend>
                        <select name='booking[touchupRequired]' defaultValue={bookingInfo.touchupRequired} className='select validator w-full' onChange={handleChange} required>
                            <option key={1}>Yes</option>
                            <option key={2}>No</option>
                        </select>
                        <div className='validator-hint'>Please choose yes or no</div>

                        <legend className='fieldset-legend text-base'>Down Payment</legend>
                        <select name='booking[downPayment]' defaultValue='None' className='select validator w-full' onChange={handleChange} required>
                            <option disabled={true}>None</option>
                            <option key={1}>Full</option>
                            <option key={2}>50%</option>
                        </select>
                        <div className='validator-hint'>Please choose a down payment option to validate booking</div>
                   </fieldset>

                    <button
                        value='submit'
                        className='btn btn-sm btn-neutral mt-4 w-max flex justify-self-end uppercase tracking-wider font-italiana font-extralight'
                    >
                        Add Booking
                    </button>
                </form>
            </div>
        </dialog>
    );
};

export default AddBookingModal;