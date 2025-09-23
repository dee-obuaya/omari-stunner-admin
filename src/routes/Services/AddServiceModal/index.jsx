import { useState } from 'react';
import Alert from '../../../components/Alert';

const AddServiceModal = () => {
    const tags = ['makeup', 'brows', 'lashes'];
    const formData = new FormData();
    const [service, setService] = useState('');
    const [tag, setTag] = useState('');


    const handleChange = (e) => {
        const {name, value} = e.target;
        if (name === 'service') setService(value);
        if (name === 'tag') setTag(value);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        formData.append('service', service);
        formData.append('tag', tag);

        try {
            const res = await fetch('http://localhost:5000/api/admin/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:  new URLSearchParams(formData).toString(),
            });

            if (!res.ok) {
                return <Alert type='error' message={`${res.message}`} />;
            };

            const data = await res.json();
            setService('');
            setTag('');
            document.getElementById('add-service-modal').close();
            return <Alert type='success' message={`${data.service} Service added successfully!`} />;
        } catch (error) {
            console.error('Error:', error);
            return <Alert type='error' message={`Error: ${error.message}`} />;
        }
    };

    return (
        <dialog id='add-service-modal' className='modal'>
            <div className='modal-box'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form id='form' className='my-4 mx-16 font-libertinus tracking-widest' onSubmit={handleSubmit}>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <fieldset className='fieldset'>
                        <legend className='fieldset-legend'>Service</legend>
                        <input type='text' name='service' value={service} onChange={handleChange} className='input validator' placeholder='Service Name' />

                        <legend className='fieldset-legend'>Tag</legend>
                        <input type='text' name='tag' value={tag} onChange={handleChange} className='input validator' placeholder='Service Tag' list='tags' />
                        <datalist id='tags'>
                            {tags.map((tag, index) => (
                                <option value={tag} key={index}>{tag}</option>
                            ))}
                        </datalist>
                    </fieldset>

                    <button
                        value='submit'
                        className='btn btn-sm btn-neutral mt-4 w-max flex justify-self-end uppercase tracking-wider font-italiana font-extralight'
                    >
                        Add Service
                    </button>
                </form>
            </div>
        </dialog>
    );
};

export default AddServiceModal;