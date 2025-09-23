import React, { useEffect, useState } from 'react';
import AddServiceModal from './AddServiceModal';
import EditServiceModal from './EditServiceModal';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import Alert from '../../components/Alert';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const headers = ['Service', 'Tag', 'Actions'];
    const itemsPerPage = 10;
    const [serviceToEdit, setServiceToEdit] = useState(null);

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

    const handleEditClick = (serviceDetails) => {
        console.log('Edit', serviceDetails);
        setIsEditModalOpen(true);
        setServiceToEdit(serviceDetails);
        document.getElementById('edit-service-modal').showModal()
    };

    const deleteService = async (serviceId) => {
        console.log('Delete', serviceId._id);
        return <Alert type='info' message={`Delete service with ID: ${serviceId}`} />;
    };

    return (
        loading ? (
            <Loader size='xl' />
        ) :
        (
            <div className='mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14'>
                <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest mb-4'>Services</h1>

                <div className='divider mt-0 mb-4'></div>

                <div className='flex justify-end mb-4'>
                    <button
                        className='btn btn-xs sm:btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'
                        onClick={()=>document.getElementById('add-service-modal').showModal()}
                    >
                       <SlPlus className='text-sm' /> New Service
                    </button>
                </div>

                <div className='overflow-x-auto rounded-box h-96'>
                    <table className='table table-pin-rows bg-base-100 tracking-wider font-libertinus'>
                        {/* head */}
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((service) => (
                                <tr key={service._id} className='hover:bg-base-300'>
                                    <td>{service.service}</td>
                                    <td>{service.tag}</td>
                                    <td>
                                        <div className='flex space-x-4 justify-center'>
                                            <button
                                                className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                                                data-tip='Edit Service'
                                                onClick={()=> handleEditClick(service)}
                                            >
                                                <SlPencil className='text-lg' />
                                            </button>

                                            <button
                                                className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                                                data-tip='Delete Service'
                                                onClick={() => deleteService(service)}
                                            >
                                                <SlTrash className='text-lg' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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

                <AddServiceModal />
                {isEditModalOpen && <EditServiceModal service={serviceToEdit} />}
            </div>
        )
    );
};

export default Services;