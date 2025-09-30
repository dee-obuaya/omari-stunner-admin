import React, { useEffect, useState } from 'react';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import Alert from '../../components/Alert';
import ConfirmPopup from '../../components/ConfirmPopup';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const headers = ['Service', 'Tag', 'Price', 'Actions'];
    const itemsPerPage = 10;
    const [serviceToEdit, setServiceToEdit] = useState({});
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [showAlert, setShowAlert] = useState(false);
    const formData = new FormData();

    useEffect(() => {
        const timer = setTimeout(() => {
            getServices();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = services.slice(startIndex, endIndex);

    const getServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
        setLoading(false);
    };

    const addNewService = async (data) => {
        // console.log('main: ', data);
        formData.append('service', data.service);
        formData.append('tag', data.tag);
        formData.append('price', data.price);

        try {
            const res = await fetch('http://localhost:5000/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:  new URLSearchParams(formData).toString(),
            });

            if (!res.ok) {
                // console.log(res);
                setAlert({ type: 'error', message: res.json().statusText || res.json().message });
                setShowAlert(true);
                return;
            };

            const response = await res.json();
            if (response.service) {
                setAlert({type: 'success', message: `${response.service} service added successfully!`});
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
            getServices();
        };
    };

    const handleEditClick = (serviceDetails) => {
        setIsEditModalOpen(true);
        setServiceToEdit(serviceDetails);
        setTimeout(() => {
            document.getElementById('edit-service-modal').showModal();
        }, 200);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setServiceToEdit({});
    };

    const editService = async (data) => {
        // console.log('edit: ', data);
        formData.append('service', data.service);
        formData.append('tag', data.tag);
        formData.append('price', data.price)

        try {
            const res = await fetch(`http://localhost:5000/api/services/${serviceToEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:  new URLSearchParams(formData).toString(),
            });

            if (!res.ok) {
                // console.log(res);
                setAlert({ type: 'error', message: res.json().statusText });
                setShowAlert(true);
                return;
            };

            const response = await res.json();

            if (response.service) {
                setAlert({type: 'success', message: `${response.service} service updated successfully!`});
                setShowAlert(true);
                setIsEditModalOpen(false);
            } else {
                setAlert({ type: 'error', message: response.message || response.statusText });
                setShowAlert(true);
            };
        } catch (error) {
            console.error('Error updating service:', error);
            setAlert({ type: 'error', message: `Error: ${error.message}` });
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            getServices();
        }
    }

    const deleteService = async (serviceId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${serviceId._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setAlert({ type: 'error', message: 'Failed to delete service.' });
                setShowAlert(true);
            };

            setAlert({ type: 'success', message: data.message });
            setShowAlert(true);

        } catch (error) {
            console.error('Error deleting service:', error);
            setAlert({ type: 'error', message: `Error: ${error}` });
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            getServices();
        };
    };

    return (
        loading ? (
            <Loader size='xl' />
        ) :
        (
            <>
                {showAlert && <Alert type={alert.type} message={alert.message} />}

                <div className='mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14'>
                    <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest mb-4'>Services</h1>

                    <div className='divider mt-0 mb-4'></div>

                    <div className='flex justify-end mb-4'>
                        <button
                            className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'
                            onClick={()=>document.getElementById('add-service-modal').showModal()}
                        >
                        <SlPlus className='text-sm' /> New Service
                        </button>
                    </div>

                    <div className='overflow-x-auto h-96'>
                        <table className='table table-pin-rows bg-base-100 tracking-wider font-libertinus'>
                            {/* head */}
                            <thead>
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} className='text-nowrap'>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((service) => (
                                        <tr key={service._id} className='hover:bg-base-300'>
                                            <td className='text-nowrap'>{service.service}</td>
                                            <td>{service.tag}</td>
                                            <td>{service.price || '0'}</td>
                                            <td>
                                                <div className='flex space-x-4 justify-center'>
                                                    <button
                                                        className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                                                        data-tip='Edit Service'
                                                        onClick={()=> handleEditClick(service)}
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
                                                        title='Delete Service'
                                                        message={`Are you sure you want to delete the ${service.service} service? This action cannot be undone.`}
                                                        confirmText='Yes, Delete'
                                                        cancelText='Cancel'
                                                        onConfirm={() => deleteService(service)}
                                                        canCancel={true}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={headers.length} className='text-center'>No images found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className='flex justify-center mt-4'>
                        <Pagination
                            totalItems={services.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>

                    <AddServiceModal submitNewService={addNewService} />
                    {isEditModalOpen && <EditServiceModal service={serviceToEdit} submitUpdatedService={editService} handleClose={handleCloseEditModal}/>}

                </div>
            </>
        )
    );
};

export default Services;