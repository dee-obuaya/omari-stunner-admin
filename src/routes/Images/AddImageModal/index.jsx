/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import MultiSelect from '../../../components/MultiSelect';
import Loader from '../../../components/Loader';

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
            const res = await fetch('http://localhost:5000/api/services');

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
        <dialog id='add-image-modal' className='modal' onClose={resetForm}>
            {loading ? (
                <Loader size='lg' />
            ) : (
                <div className='modal-box' >
                    <form method='dialog'>
                        {/* if there is a button in form, it will close the modal */}
                        <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                    </form>

                    <form id='form' className='my-4 mx-5 md:mx-16 font-libertinus tracking-widest' method='post' encType='multipart/form-data' onSubmit={handleSubmit}>
                        {/* <h3 className='font-bold text-lg mb-4'>Add New Image</h3> */}
                        <fieldset className='fieldset gap-0'>
                            <legend className="fieldset-legend text-base">Pick a file</legend>
                            <input
                                type="file"
                                name="image"
                                className="file-input file-input-ghost validator"
                                onChange={handleFileChange}
                                required
                                title="Only .jpg, .png, .jpeg, .heic"
                                multiple={uploadMultiple}
                            />
                            {/* add input checkbox to tick if uploading multiple */}
                            {/* <label className="label">Max size 2MB</label> */}
                            <div className='validator-hint'>Please choose an image (Only .jpg, .png, .jpeg, .heic)</div>


                            <legend className='fieldset-legend'>Service</legend>
                            <select name='service' defaultValue='Pick a service' className='select validator' onChange={handleServiceChange} required>
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
        </dialog>
    )
};

export default AddImageModal;