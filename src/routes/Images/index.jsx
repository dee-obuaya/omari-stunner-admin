/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { transformationStringFromObject } from '@cloudinary/url-gen';
import { motion } from 'motion/react';
import { SlPlus, SlTrash } from 'react-icons/sl';
import AddImageModal from './AddImageModal';
import Loader from '../../components/Loader';
import Table from '../../components/Table';
import { useAlert } from '../../contexts/AlertContext';
import ConfirmPopup from '../../components/ConfirmPopup';
import cld from '../../utils/cloudinary';
import { API_BASE_URL, IMAGES_TABLE_KEY } from '../../constants/ServerUrl';

const Images = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const {showAlert} = useAlert();
    const [imageToDelete, setImageToDelete] = useState({});
    const formData = new FormData();
    const [pagination, setPagination] = useState({ totalItems: 0, itemsPerPage: 10, currentPage: 1 });

    const loadState = () => {
        const savedState = sessionStorage.getItem(IMAGES_TABLE_KEY);

        if (!savedState) return { filters: {}, page: 1 };

        try {
            const parsedState = JSON.parse(savedState);
            return {
                filters: parsedState.currentFilters || null,
                page: parsedState.currentPage || 1,
            };
        } catch (error) {
            console.error('Error parsing saved table state:', error);
            return { filters: {}, currentPage: 1 };
        }
    }

    const [{filters, page}, setTableState] = useState(loadState());

    const columns = [
        {title: 'Image', dataId: 'image', render: (img) => {
            // console.log(img);
            return (
                <div className='flex items-center justify-center justify-self-center space-x-4'>
                    <div className='avatar'>
                        <div className='mask mask-squircle h-16 w-16 md:h-28 md:w-28'>
                            <img
                            src={`${img.row.original.image.url}`}
                            alt={`Omari Stunner ${img.row.original.service.service} image`} />
                        </div>
                    </div>
                    <div className={`${!img.row.original.image.name && 'hidden'}`}>
                        <div className='font-bold'>{img.row.original.image.name}</div>
                    </div>
                </div>
            );
        }},
        {
            title: 'Service',
            dataId: 'service',
            filter: ['All', 'Makeup', 'Lashes', 'Brows'],
            render: (img) => (
                <div className='badge badge-soft badge-info h-fit'>{img.row.original.service.service}</div>

            )
        },
        {title: 'Actions', dataId: 'actions', render: (img) => {
            return (
                <div className='flex space-x-4 justify-center'>
                    <ConfirmPopup
                        trigger={
                            <button
                                className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                                data-tip='Delete Image'
                            >
                                <SlTrash className='text-lg' />
                            </button>
                        }
                        title='Delete Image'
                        message={`Are you sure you want to delete this image? This action cannot be undone.`}
                        confirmText='Yes, Delete'
                        cancelText='Cancel'
                        onConfirm={() => handleDelete(img.row.original)}
                        canCancel={true}
                    />
                </div>
            );
        }}
    ];

    const transformation = transformationStringFromObject([
        {gravity: 'face', height: 112, width: 112, crop: 'thumb'}
    ])

    useEffect(() => {
        let visibilityTimer;
        const timer = setTimeout(() => {
            fetchImages(page, filters);
            visibilityTimer = setTimeout(() => {
                setVisible(true);
            }, 500);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    // useEffect(() => {
    //     console.log('Table state changed:', {filters, page});
    // }, [filters, page]);

    const fetchImages = async (page = pagination.currentPage, filterValues = {filters}) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', pagination.itemsPerPage);

            Object.entries(filterValues).forEach(([key, value]) => {
                if (value && value !== 'All') params.set(key, value);
            });


            const res = await fetch(`${API_BASE_URL}/api/images?${params}`, {credentials: 'include'});
            const data = await res.json();

            if (res.ok) {

                const transformedImages = data?.images?.map(img => {
                    const imageToTransform = cld.image(img?.image?.filename);

                    const transformedImgUrl = imageToTransform?.addTransformation(transformation).toURL();

                    img.image.url = transformedImgUrl;

                    return img;
                });

                setImages(transformedImages);
                // console.log(transformedImages)
                setPagination(prev => ({
                    ...prev,
                    totalItems: data?.pagination?.totalItems,
                    currentPage: data?.pagination?.currentPage
                }));
            }else {
                showAlert({ type: 'error', message: data.message || 'Failed to fetch services.' });
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            showAlert({ type: 'error', message: error || 'Failed to fetch images.' });
        } finally {
            setLoading(false);
        };
    };

    const addNewImage = async (imageData) => {
        formData.append('image', imageData.imageFile);
        formData.append('service', imageData.service);

        // console.log('form data:', ...formData);

        try {
            const res = await fetch(`${API_BASE_URL}/api/images`, {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'multipart/form-data',
                // },
                body:  formData,
                credentials: 'include',
            });

            const data = await res.json();

            if (data.message) {
                showAlert({ type: 'error', message: data.message });
                return
            };

            // console.log(data);

            showAlert({type: 'success', message: `Image added successfully!`});
        } catch (error) {
            console.error('Error:', error);
            showAlert({type: 'error', message: `Error: ${error.message}`});
        } finally {
            fetchImages();
        };
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handleDelete = (img) => {
        setImageToDelete({...img});
        setTimeout(() => {
            deleteImage();
        }, 200);
    };

    const deleteImage = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/images/${imageToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert({ type: 'error', message: 'Failed to delete image.' });
                return;
            };

            showAlert({ type: 'success', message: data.message });

        } catch (error) {
            console.error('Error deleting image:', error);
            showAlert({ type: 'error', message: `Error: ${error}` });
        } finally {
            setImageToDelete(null);
            fetchImages();
        };
    };

    return (
        loading ? (
            <Loader size='xl' />
        ) : (
            <>
                <div className={`transition-all ease-initial duration-700 ${visible ? 'opacity-100 mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14' : 'opacity-0'}`}>
                    <div className='space-y-0.5 mb-4'>
                        <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest'>Images</h1>
                        <p className='text-base font-libertinus tracking-wider text-neutral-500'>Manage gallery images</p>
                    </div>

                    <div className='divider mt-0 mb-4'></div>

                    <div className='flex justify-end mb-4'>
                        <motion.button
                            initial={{scale: 0.9}}
                            whileHover={{scale: 1}}
                            whileTap={{scale: 0.85}}
                            transition={{duration: 0.4, delay: 0.25, ease: [0, 0.71, 0.2, 1.01],}}
                            className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'
                            onClick={()=>{
                                setIsAddModalOpen(true);
                                setTimeout(() => {
                                    document.getElementById('add-image-modal').showModal();
                                }, 200);
                            }}
                        >
                        <SlPlus className='text-sm' /> New Image
                        </motion.button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={images}
                        pagination={pagination}
                        loading={loading}
                        currentFilters={filters}
                        currentPage={pagination.currentPage}
                        onFilterChange={(newFilters) => {
                            setTableState(prev => ({...prev, filters: newFilters, page: 1}));
                            sessionStorage.setItem(IMAGES_TABLE_KEY, JSON.stringify({currentFilters: newFilters, currentPage: 1}));
                            fetchImages(1, newFilters); }}
                        onPageChange={(newPage) => {
                            setTableState(prev => ({...prev, page: newPage}));
                            sessionStorage.setItem(IMAGES_TABLE_KEY, JSON.stringify({currentPage: newPage, currentFilters: filters}));
                            fetchImages(newPage, filters);
                        }}
                    />

                    {isAddModalOpen && <AddImageModal key='modal' submitNewImage={addNewImage} handleClose={handleCloseModal}/>}
                </div>
            </>
        )
    );
};

export default Images;