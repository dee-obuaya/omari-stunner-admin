/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import { useAlert } from '../../contexts/AlertContext';
import ConfirmPopup from '../../components/ConfirmPopup';
import { API_BASE_URL, SERVICES_TABLE_KEY } from '../../constants/ServerUrl';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState({});
    const [serviceToEdit, setServiceToEdit] = useState({});
    const {showAlert} = useAlert();
    const formData = new FormData();
    const [pagination, setPagination] = useState({ totalItems: 0, itemsPerPage: 10, currentPage: 1 });

    const loadState = () => {
        const savedState = sessionStorage.getItem(SERVICES_TABLE_KEY);

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
            return { filters: {}, sort: { key: null, direction: null }, page: 1 };
        }
    };

    const [{filters, sortConfig, page}, setTableState] = useState(loadState());

    const columns = [
        {
            title: 'Service',
            dataId: 'service',
            sort: true
        },
        {
            title: 'Tag',
            dataId: 'tag',
            filter: ['All', 'Makeup', 'Lashes', 'Brows']
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
                            title='Delete Service'
                            message={`Are you sure you want to delete the ${service.row.original.label} service? This action cannot be undone.`}
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
            getServices(page, sortConfig, filters);
            visibilityTimer = setTimeout(() => {
                setVisible(true);
            }, 500);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    const getServices = async (page = pagination.currentPage, sort = {sortConfig}, filterValues = {filters}) => {
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

            const response = await fetch(`${API_BASE_URL}/api/services?${params}`, {credentials: 'include'});
            const data = await response.json();

            if (response.ok) {
                setServices(data.services);
                setPagination(prev => ({
                    ...prev,
                    totalItems: data.pagination.totalItems,
                    currentPage: data.pagination.currentPage
                }));
            } else {
                showAlert({ type: 'error', message: data.message || 'Failed to fetch services.' });
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
            const res = await fetch(`${API_BASE_URL}/api/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:  new URLSearchParams(formData).toString(),
                credentials: 'include',
            });

            if (!res.ok) {
                // console.log(res);
                showAlert({ type: 'error', message: res.json().statusText || res.json().message });
                return;
            };

            const response = await res.json();
            if (response.service) {
                showAlert({type: 'success', message: `${response.service} service added successfully!`});
            } else {
                showAlert({ type: 'error', message: response.message });
            };

        } catch (error) {
            console.error('Error:', error);
            showAlert({type: 'error', message: `Error: ${error.message}`});
        } finally {
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

    const handleDeleteClick = (service) => {
        setServiceToDelete({...service});
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
            const res = await fetch(`${API_BASE_URL}/api/services/${serviceToEdit._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:  new URLSearchParams(formData).toString(),
                credentials: 'include',
            });

            const response = await res.json();

            if (!res.ok) {
                // console.log(res);
                showAlert({ type: 'error', message: response.statusText || response.message });
                return;
            };


            if (response.service) {
                showAlert({type: 'success', message: `${response.service} service updated successfully!`});
                setIsEditModalOpen(false);
            } else {
                showAlert({ type: 'error', message: response.message || response.statusText });
            };
        } catch (error) {
            console.error('Error updating service:', error);
            showAlert({ type: 'error', message: `Error: ${error.message}` });
        } finally {
            getServices();
        }
    }

    const deleteService = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/services/${serviceToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert({ type: 'error', message: 'Failed to delete service.' });
            };

            showAlert({ type: 'success', message: data.message });
            getServices();

        } catch (error) {
            console.error('Error deleting service:', error);
            showAlert({ type: 'error', message: `Error: ${error}` });
        }
    };

    return (
        loading ? (
            <Loader size='xl' />
        ) :
        (
            <>

                <motion.div
                    className={`transition-all ease-initial duration-700 ${visible ? 'mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14' : ''}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
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
                        pagination={pagination}
                        loading={loading}
                        currentSort={sortConfig}
                        currentFilters={filters}
                        currentPage={pagination.currentPage}
                        onSortChange={(newSort) => {
                            setTableState(prev => ({...prev, sortConfig: newSort, page: 1}));
                            sessionStorage.setItem(SERVICES_TABLE_KEY, JSON.stringify({currentFilters: filters, currentSort: newSort, currentPage: 1}));
                            getServices(1, newSort, filters);
                        }}
                        onFilterChange={(newFilters) => {
                            setTableState(prev => ({...prev, filters: newFilters,  page: 1}));
                            sessionStorage.setItem(SERVICES_TABLE_KEY, JSON.stringify({currentFilters: newFilters, currentSort: sortConfig, currentPage: 1}));
                            getServices(1, sortConfig, newFilters);
                        }}
                        onPageChange={(newPage) => {
                            setTableState(prev => ({...prev, page: newPage}));
                            sessionStorage.setItem(SERVICES_TABLE_KEY, JSON.stringify({currentFilters: filters, currentSort: sortConfig, currentPage: newPage}));
                            getServices(newPage, sortConfig, filters)
                        }}
                    />

                    {isAddModalOpen && <AddServiceModal submitNewService={addNewService} />}
                    {isEditModalOpen && <EditServiceModal service={serviceToEdit} submitUpdatedService={editService} handleClose={handleCloseModal}/>}

                </motion.div>
            </>
        )
    );
};

export default Services;