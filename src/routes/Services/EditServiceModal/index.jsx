import React, {useState} from 'react';

const EditServiceModal = ({ service, submitUpdatedService, handleClose }) => {
    const tags = ['makeup', 'brows', 'lashes'];
    const [formInfo, setFormInfo] = useState({
        service: service.service,
        tag: service.tag,
        price: service.price
    })

    const handleChange = (e) => {
        const {name, value} = e.target;

        if (name === 'service') setFormInfo({...formInfo, service: value});
        if (name === 'tag') setFormInfo({...formInfo, tag: value});
        if (name === 'price') setFormInfo({...formInfo, price: value})
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        submitUpdatedService({...formInfo});

        document.getElementById('edit-service-modal').close();
    };

    return (
        <dialog id='edit-service-modal' className='modal' onClose={handleClose}>
            <div className='modal-box'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form id='form' className='mt-4 mx-16 font-libertinus tracking-widest' onSubmit={handleSubmit}>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <fieldset className='fieldset'>
                        <legend className='fieldset-legend text-base'>Service</legend>
                        <input type='text' name='service' value={formInfo.service} className='input validator' placeholder='Service Name' onChange={handleChange} required title='Only letters and/or dash (hyphen)' />
                        <div className="validator-hint">Please enter a service name</div>

                        <legend className='fieldset-legend text-base'>Tag</legend>
                        <input type='text' name='tag' value={formInfo.tag}  className='input validator' placeholder='Service Tag' list='tags' onChange={handleChange} required title='Only letters' />
                        <div className="validator-hint">Please enter a service tag (e.g: makeup, lashes, or brows)</div>
                        <datalist id='tags'>
                            {tags.map((tag, index) => (
                                <option value={tag} key={index}>{tag}</option>
                            ))}
                        </datalist>

                        <legend className='fieldset-legend text-base'>Price</legend>
                        <input type='number' name='price' value={formInfo.price}  className='input' placeholder='Service Price' onChange={handleChange} />
                    </fieldset>

                    <button
                        value='submit'
                        className='btn btn-sm btn-neutral mt-4 w-max flex justify-self-end uppercase tracking-wider font-italiana font-extralight'>
                        Update Service
                    </button>
                </form>
            </div>
        </dialog>
    )
};

export default EditServiceModal;