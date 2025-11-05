/* eslint-disable no-unused-vars */
import { useState } from 'react';

const EditUserModal = ({user, submitUpdatedUser, handleClose}) => {
    const [userInfo, setUserInfo] = useState({
        name: user.name,
        username: user.username,
        password: user.password,
        verifyPassword: user.password,
        role: user.role
    });
    const [passwordError, setPasswordError] = useState(false);

    const handleChange = e => {
        const {name, value} = e.target;

        if (name === 'user[name]') setUserInfo({...userInfo, name: value});
        if (name === 'user[username]') setUserInfo({...userInfo, username: value});
        if (name === 'user[password]') setUserInfo({...userInfo, password: value});
        if (name === 'user[verify-password]') {
            setUserInfo({...userInfo, verifyPassword: value});
            if (userInfo.password !== value) setPasswordError(true)
            if (userInfo.password === value && passwordError) setPasswordError(false);
        };
        if (name === 'user[role]') setUserInfo({...userInfo, role: value.toLowerCase()});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const keyToDelete ='verifyPassword';

        const {[keyToDelete]: _, ...userDetails} = userInfo

        await submitUpdatedUser({userDetails});

        closeModal();
    };

    const closeModal = () => {
        document.getElementById('edit-user-modal').close();

        handleClose();
    };


    return (
        <dialog id='edit-user-modal' className='modal' onClose={closeModal}>
            <div className='modal-box lg:max-w-3xl'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form id='form' className='my-4 px-4 md:px-8 lg:px-0 lg:mx-auto font-libertinus tracking-widest' onSubmit={handleSubmit}>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <fieldset className='fieldset lg:max-w-3/4 md:mx-auto lg:px-10'>
                        <legend className='fieldset-legend text-base'>Name</legend>
                        <input type='text' name='user[name]' value={userInfo.name} onChange={handleChange} className='input validator w-full' placeholder='Name' required title='Only letters and/or dash (hyphen)' />
                        <div className='validator-hint'>Please enter user's name</div>

                        <legend className='fieldset-legend text-base'>Username</legend>
                        <input type='text' name='user[username]' value={userInfo.username} onChange={handleChange} className='input validator w-full' placeholder='Username' required title='Only letters' />
                        <div className='validator-hint'>Please enter user's username</div>

                        <legend className='fieldset-legend text-base'>Password</legend>
                        <input type='text' name='user[password]' value={userInfo.password} onChange={handleChange} className='input validator w-full' placeholder='Password' required />
                        <div className='validator-hint'>Please enter user's password</div>

                        <legend className='fieldset-legend text-base'>Verify Password</legend>
                        <input type='text' name='user[verify-password]' value={userInfo.verifyPassword} onChange={handleChange} className='input validator w-full' placeholder='Enter password again' required />
                        <div className='validator-hint'>Please enter user's password</div>
                        {passwordError && <div className='text-error'>Passwords do not match</div>}

                        <legend className='fieldset-legend text-base'>Role</legend>
                        <select name='user[role]' value={userInfo.role} className='select validator w-full' onChange={handleChange} required>
                            <option disabled={true}>None</option>
                            <option key={1}>Admin</option>
                            <option key={2}>Employee</option>
                        </select>
                        <div className='validator-hint'>Please select user's role</div>
                   </fieldset>

                    <button
                        value='submit'
                        className='btn btn-sm btn-neutral text-neutral-content mt-4 w-max flex justify-self-end uppercase tracking-widest font-italiana font-extralight'
                    >
                        Update User
                    </button>
                </form>
            </div>
        </dialog>
    );
};

export default EditUserModal;