/* eslint-disable no-unused-vars */
import React, { use, useEffect, useState } from 'react';
import { transformationStringFromObject } from '@cloudinary/url-gen';
import { SlPlus, SlTrash } from 'react-icons/sl';
import AddImageModal from './AddImageModal';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import ConfirmPopup from '../../components/ConfirmPopup';
import cld from '../../utils/cloudinary';

const Images = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [showAlert, setShowAlert] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const headers = ['Image', 'Service', 'Actions'];
    const formData = new FormData();
    const itemsPerPage = 10;

    const transformation = transformationStringFromObject([
        {gravity: 'face', height: 112, width: 112, crop: 'thumb'}
    ])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchImages();
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentImages = images?.slice(startIndex, endIndex);

    const fetchImages = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/images');

            if (res.ok) {
                const data = await res.json();

                const transformedImages = data.map(img => {
                    const imageToTransform = cld.image(img.image.filename);

                    const transformedImgUrl = imageToTransform.addTransformation(transformation).toURL();

                    img.image.url = transformedImgUrl;

                    return img;
                });

                setImages(transformedImages);
                // console.log(transformedImages)
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            setAlert({ type: 'error', message: error || 'Failed to fetch images.' });
            setShowAlert(true);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        };
    };

    const addNewImage = async (imageData) => {
        formData.append('image', imageData.imageFile);
        formData.append('service', imageData.service);

        // console.log('form data:', ...formData);

        try {
            const res = await fetch('http://localhost:5000/api/images', {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'multipart/form-data',
                // },
                body:  formData,
            });

            const data = await res.json();

            if (data.message) {
                setAlert({ type: 'error', message: data.message });
                setShowAlert(true);
                return
            };

            // console.log(data);

            setAlert({type: 'success', message: `Image added successfully!`});
            setShowAlert(true);
        } catch (error) {
            console.error('Error:', error);
            setAlert({type: 'error', message: `Error: ${error.message}`});
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            fetchImages();
        };
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handleDelete = (img) => {
        setImageToDelete(img);
        setTimeout(() => {
            deleteImage(imageToDelete);
        }, 200);
    }

    const deleteImage = async (image) => {
        try {
            const response = await fetch(`http://localhost:5000/api/images/${image._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                setAlert({ type: 'error', message: 'Failed to delete image.' });
                setShowAlert(true);
            };

            setAlert({ type: 'success', message: data.message });
            setShowAlert(true);

        } catch (error) {
            console.error('Error deleting image:', error);
            setAlert({ type: 'error', message: `Error: ${error}` });
            setShowAlert(true);
        } finally {
            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            setImageToDelete(null);
            fetchImages();
        };
    };

    return (
        loading ? (
            <Loader size='xl' />
        ) : (
            <>
                {showAlert && <Alert type={alert.type} message={alert.message} />}

                <div className='mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14'>
                    <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest mb-4'>Images</h1>

                    <div className='divider mt-0 mb-4'></div>

                    <div className='flex justify-end mb-4'>
                        <button
                            className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'
                            onClick={()=>{
                                setIsAddModalOpen(true);
                                setTimeout(() => {
                                    document.getElementById('add-image-modal').showModal();
                                }, 200);
                            }}
                        >
                        <SlPlus className='text-sm' /> New Image
                        </button>
                    </div>

                    <div className='overflow-x-auto h-9/12 lg:h-96'>
                        <table className='table table-xs md:table-sm table-pin-rows bg-base-100 tracking-wider font-libertinus'>
                            {/* head */}
                            <thead>
                                <tr>
                                    {/* <th key='checkbox'></th> */}
                                    {headers.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentImages.length > 0 ? (
                                    currentImages.map((img) => (
                                        <tr key={img.image._id} className='hover:bg-base-300'>
                                            {/* <th>
                                                <label>
                                                    <input type='checkbox' className='checkbox' />
                                                </label>
                                            </th> */}
                                            <td>
                                                <div className='flex items-center gap-3'>
                                                    <div className='avatar'>
                                                        <div className='mask mask-squircle h-16 w-16 md:h-28 md:w-28'>
                                                            <img
                                                            src={`${img.image.url}`}
                                                            alt={`Omari Stunner ${img.service.service} image`} />
                                                        </div>
                                                    </div>
                                                    <div className={`${!img.image.name && 'hidden'}`}>
                                                        <div className='font-bold'>{img.image.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className='badge badge-soft badge-secondary h-fit'>{img.service.service}</div>
                                            </td>
                                            <td>
                                                <div className='flex space-x-4 justify-center'>
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
                                                        message={`Are you sure you want to delete this image? This action cannot be undone.`}
                                                        confirmText='Yes, Delete'
                                                        cancelText='Cancel'
                                                        onConfirm={() => handleDelete()}
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

                    {images && (
                        <div className='flex justify-center mt-4'>
                            <Pagination
                                totalItems={images.length}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}

                    {isAddModalOpen && <AddImageModal submitNewImage={addNewImage} handleClose={handleCloseModal}/>}
                </div>
            </>
        )
    );
};

export default Images;