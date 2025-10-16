import { useState } from 'react';

const AddServiceModal = ({submitNewService}) => {
    const tags = ['makeup', 'brows', 'lashes'];
    const [formInfo, setFormInfo] = useState({
        service: '',
        tag: '',
        price: 0
    });


    const handleChange = (e) => {
        const {name, value} = e.target;
        if (name === 'service') setFormInfo({...formInfo, service: value})
        if (name === 'tag') setFormInfo({...formInfo, tag: e.target.value})
        if (name === 'price') setFormInfo({...formInfo, price: value})
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // console.log({...formInfo})
        submitNewService({...formInfo});

        setFormInfo({...formInfo,
            service: '',
            tag: '',
            price: 0
        });

        document.getElementById('add-service-modal').close();
    };

    const resetForm = () => {
        setFormInfo({...formInfo,
            service: '',
            tag: '',
            price: 0
        })
    }

    return (
        <dialog id='add-service-modal' className='modal' onClose={resetForm}>
            <div className='modal-box'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form id='form' className='my-4 mx-16 font-libertinus tracking-widest' onSubmit={handleSubmit}>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <fieldset className='fieldset'>
                        <legend className='fieldset-legend text-base'>Service</legend>
                        <input type='text' name='service' value={`${formInfo.service}`} onChange={handleChange} className='input validator' placeholder='Service Name' required title='Only letters and/or dash (hyphen)' />
                        <div className="validator-hint">Please enter a service name</div>

                        <legend className='fieldset-legend text-base'>Tag</legend>
                        <select name='tag' defaultValue='Pick a service tag' className='select validator' onChange={handleChange} required>
                            <option disabled={true}>Pick a service tag</option>
                            {tags.map((tag, index) => {
                                return <option key={index}>{tag}</option>
                            })}
                        </select>
                        <div className='validator-hint'>Please choose a service tag</div>

                        <legend className='fieldset-legend text-base'>Price</legend>
                        <input type='number' name='price' value={`${formInfo.price}`} onChange={handleChange} className='input' placeholder='Service Price' />
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