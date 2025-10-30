import { useState } from 'react';

const EditTabModal = ({tab, submitUpdatedTab, handleClose}) => {
    const [formInfo, setFormInfo] = useState({
        name: tab.name,
        label: tab.label,
        active: tab.active
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        if (name === 'name') setFormInfo({...formInfo, name: value});
        if (name === 'label') setFormInfo({...formInfo, label: value});
        if (name === 'active') setFormInfo({...formInfo, active: !formInfo.active});
        console.log(formInfo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        submitUpdatedTab({...formInfo});

        document.getElementById('edit-tab-modal').close();
        handleClose();
    };

    return (
        <dialog id='edit-tab-modal' className='modal' onClose={handleClose}>
            <div className='modal-box lg:max-w-3xl'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form id='form' className='mt-4 px-4 md:px-8 lg:px-0 lg:mx-auto font-libertinus tracking-widest' onSubmit={handleSubmit}>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <fieldset className='fieldset lg:max-w-3/4 md:mx-auto lg:px-10'>
                        <legend className='fieldset-legend text-base'>Tab Name</legend>
                        <input type='text' name='name' value={formInfo.name} className='input validator w-full' placeholder='Tab Name' onChange={handleChange} required title='Only letters and/or dash (hyphen)' />
                        <div className="validator-hint">Please enter a tab name</div>

                        <legend className='fieldset-legend text-base'>Tab Label
                            <span className='text-sm text-neutral-500/25 tracking-wide'>(how it will be displayed)</span>
                        </legend>
                        <input type='text' name='label' value={formInfo.label}  className='input validator w-full' placeholder='Tab Label' onChange={handleChange} required title='Only letters' />
                        <div className="validator-hint">Please enter a tab label</div>

                        <legend className='fieldset-legend text-base'>Active Status</legend>
                        <input
                            type='checkbox'
                            checked={formInfo.active}
                            onChange={handleChange}
                            name='active'
                            className='toggle checked:border-green-950 checked:bg-success checked:text-success-content'
                        />
                    </fieldset>

                    <button
                        value='submit'
                        className='btn btn-sm btn-neutral mt-4 w-max flex justify-self-end uppercase tracking-wider font-italiana font-extralight'
                    >
                        Update Tab
                    </button>
                </form>
            </div>
        </dialog>
    )
};

export default EditTabModal;