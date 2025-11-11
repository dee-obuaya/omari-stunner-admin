/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Loader from '../../../components/Loader';
import { API_BASE_URL } from '../../../constants/ServerUrl';

const AddImageModal = ({submitNewImage, handleClose}) => {
    const [imageFile, setImageFile] = useState(null);
    const [service, setService] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadMultiple, setUploadMultiple] = useState(false);
    const [services, setServices] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            getServices();
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    const getServices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/services`, {credentials: 'include'});

            if (res.ok) {
                const data = await res.json();
                setServices(data);
            } else {
                console.log('No services');
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }

    const handleFileChange = (e) => {
        // console.log('Selected file:', e.target.files[0]);
        setImageFile(e.target.files[0]);
    };

    const handleServiceChange = (e) => {
        setService(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log('Submitting new image:', {imageFile, service});

        submitNewImage({imageFile, service});
        resetForm();

    };

    const resetForm = () => {
        setImageFile(null);
        setService('');
        document.getElementById('add-image-modal').close();
        handleClose();
    };

    return (
        <motion.dialog exit={{opacity: 0}} id='add-image-modal' className='modal' onClose={resetForm}>
            {loading ? (
                <Loader size='lg' />
            ) : (
                <div className='modal-box lg:max-w-3xl' >
                    <form method='dialog'>
                        {/* if there is a button in form, it will close the modal */}
                        <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                    </form>

                    <form id='form' className='my-4 px-4 md:px-8 lg:px-0 lg:mx-auto font-libertinus tracking-widest' method='post' encType='multipart/form-data' onSubmit={handleSubmit}>
                        {/* <h3 className='font-bold text-lg mb-4'>Add New Image</h3> */}
                        <fieldset className='fieldset gap-0 lg:max-w-3/4 md:mx-auto lg:px-10'>
                            <legend className="fieldset-legend text-base">Pick a file</legend>
                            <input
                                type="file"
                                name="image"
                                className="file-input file-input-ghost validator w-full"
                                onChange={handleFileChange}
                                required
                                title="Only .jpg, .png, .jpeg, .heic"
                                multiple={uploadMultiple}
                            />
                            {/* add input checkbox to tick if uploading multiple */}
                            {/* <label className="label">Max size 2MB</label> */}
                            <div className='validator-hint'>Please choose an image (Only .jpg, .png, .jpeg, .heic)</div>


                            <legend className='fieldset-legend'>Service</legend>
                            <select name='service' defaultValue='Pick a service' className='select validator w-full' onChange={handleServiceChange} required>
                                <option disabled={true}>Pick a service</option>
                                {services.map((svc, index) => {
                                    return <option key={index}>{svc.service}</option>
                                })}
                            </select>
                            <div className='validator-hint'>Please select a service</div>
                        </fieldset>

                        <button
                            value='submit'
                            className='btn btn-sm btn-neutral mt-4 w-max flex justify-self-end uppercase tracking-wider font-italiana font-extralight'
                        >
                            Add Image
                        </button>
                    </form>
                </div>
            )}
        </motion.dialog>
    )
};

export default AddImageModal;