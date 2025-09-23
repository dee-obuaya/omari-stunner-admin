const EditServiceModal = (props) => {
    const {service} = props;
    const tags = ['makeup', 'brows', 'lashes'];

    return (
        <dialog id='edit-service-modal' className='modal'>
            <div className='modal-box'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form className='mt-4'>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <div className='form-control mb-4 mx-16 font-libertinus tracking-widest'>
                        <fieldset className='fieldset'>
                            <legend className='fieldset-legend'>Service</legend>
                            <input type='text' className='input validator' placeholder='Service Name' value={service.service}/>

                            <legend className='fieldset-legend'>Tag</legend>
                            <input type='text' className='input validator' placeholder='Service Tag' list='tags' value={service.tag} />
                            <datalist id='tags'>
                                {tags.map((tag, index) => (
                                    <option value={tag} key={index}>{tag}</option>
                                ))}
                            </datalist>

                            <button className='btn btn-sm btn-neutral mt-4 w-max flex justify-self-end uppercase tracking-wider font-italiana font-extralight'>
                                Update Service
                            </button>
                        </fieldset>
                    </div>
                </form>
            </div>
        </dialog>
    )
};

export default EditServiceModal;