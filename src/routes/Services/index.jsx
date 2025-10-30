/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import Alert from '../../components/Alert';
import ConfirmPopup from '../../components/ConfirmPopup';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState({});
    const [serviceToEdit, setServiceToEdit] = useState({});
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [showAlert, setShowAlert] = useState(false);
    const formData = new FormData();

    const columns = [
        {
            title: 'Service',
            dataId: 'service',
        },
        {
            title: 'Tag',
            dataId: 'tag',
        },
        {
            title: 'Price',
            dataId: 'price',
        },
        {
            title: 'Actions',
            dataId: 'actions',
            render: (service) => {
            // console.log(tab);
                return (
                    <div className='flex space-x-4 justify-center'>
                        <button
                            className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                            data-tip='Edit Service'
                            onClick={()=> handleEditClick(service.row.original)}
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
                            message={`Are you sure you want to delete the ${service.row.original.label} tab? This action cannot be undone.`}
                            confirmText='Yes, Delete'
                            cancelText='Cancel'
                            onConfirm={() => handleDeleteClick(service.row.original)}
                            canCancel={true}
                        />
                    </div>
                )
            }
        }
    ];

    useEffect(() => {
        let visibilityTimer
        const timer = setTimeout(() => {
            getServices();
            visibilityTimer = setTimeout(() => {
                setVisible(true);
            }, 500);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    // const startIndex = (currentPage - 1) * itemsPerPage;
    // const endIndex = startIndex + itemsPerPage;
    // const currentItems = services.slice(startIndex, endIndex);

    const getServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services');
            const data = await response.json();

            if (response.ok) {
                setServices(data);
            } else {
                setAlert({ type: 'error', message: data.message || 'Failed to fetch services.' });
                setShowAlert(true);
            }
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
        setServiceToEdit(serviceDetails);
        setIsEditModalOpen(true);
        setTimeout(() => {
            document.getElementById('edit-service-modal').showModal();
        }, 200);
    };

    const handleCloseModal = () => {
        if (isAddModalOpen) {
            setIsAddModalOpen(false);
        } else if (isEditModalOpen) {
            setIsEditModalOpen(false);
            setServiceToEdit({});
        };
    };

    const handleDeleteClick = (tab) => {
        setServiceToDelete({...tab});
        setTimeout(() => {
            deleteService();
        }, 200);
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

            const response = await res.json();

            if (!res.ok) {
                // console.log(res);
                setAlert({ type: 'error', message: response.statusText || response.message });
                setShowAlert(true);
                return;
            };


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

    const deleteService = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/${serviceToDelete._id}`, {
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
            getServices();

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

                <div className={`transition-all ease-initial duration-700 ${visible ? 'opacity-100 mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14' : 'opacity-0'}`}>
                    <div className='space-y-0.5 mb-4'>
                        <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest'>Services</h1>
                        <p className='text-base font-libertinus tracking-widest text-neutral-500'>Manage services offered</p>
                    </div>

                    <div className='divider mt-0 mb-4'></div>

                    <div className='flex justify-end mb-4'>
                        <motion.button
                            initial={{scale: 0.9}}
                            whileHover={{scale: 1}}
                            whileTap={{scale: 0.85}}
                            transition={{duration: 0.4, delay: 0.25, ease: [0, 0.71, 0.2, 1.01],}}
                            className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'
                            onClick={()=> {
                                setIsAddModalOpen(true);
                                setTimeout(() => {
                                    document.getElementById('add-service-modal').showModal();
                                });
                            }}
                        >
                            <SlPlus className='text-sm' /> New Service
                        </motion.button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={services}
                        pagination={{
                            totalItems: services.length,
                        }}
                        tableKey='services'
                    />

                    {isAddModalOpen && <AddServiceModal submitNewService={addNewService} />}
                    {isEditModalOpen && <EditServiceModal service={serviceToEdit} submitUpdatedService={editService} handleClose={handleCloseModal}/>}

                </div>
            </>
        )
    );
};

export default Services;