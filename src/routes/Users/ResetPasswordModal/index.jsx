/* eslint-disable no-unused-vars */
import { useState } from 'react';

const ResetPasswordModal = ({submitUpdatedPassword, handleClose}) => {
    const [userInfo, setUserInfo] = useState({
        password: '',
        verifyPassword: '',
    });
    const [passwordError, setPasswordError] = useState(false);

    const handleChange = e => {
        const {name, value} = e.target;

        if (name === 'user[password]') setUserInfo({...userInfo, password: value});
        if (name === 'user[verify-password]') {
            setUserInfo({...userInfo, verifyPassword: value});
            if (userInfo.password !== value) setPasswordError(true)
            if (userInfo.password === value && passwordError) setPasswordError(false);
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const keyToDelete ='verifyPassword';

        const {[keyToDelete]: _, ...userDetails} = userInfo

        await submitUpdatedPassword({userDetails});

        closeModal();
    };

    const closeModal = () => {
        document.getElementById('edit-password-modal').close();

        handleClose();
    };


    return (
        <dialog id='edit-password-modal' className='modal' onClose={closeModal}>
            <div className='modal-box lg:max-w-3xl'>
                <form method='dialog'>
                    {/* if there is a button in form, it will close the modal */}
                    <button className='btn btn-sm btn-circle btn-ghost absolute right-2 top-2'>✕</button>
                </form>

                <form id='form' className='my-4 px-4 md:px-8 lg:px-0 lg:mx-auto font-libertinus tracking-widest' onSubmit={handleSubmit}>
                    {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                    <fieldset className='fieldset lg:max-w-3/4 md:mx-auto lg:px-10'>

                        <legend className='fieldset-legend text-base'>Password</legend>
                        <input type='text' name='user[password]' value={userInfo.password} onChange={handleChange} className='input validator w-full' placeholder='Password' required />
                        <div className='validator-hint'>Please enter user's password</div>

                        <legend className='fieldset-legend text-base'>Verify Password</legend>
                        <input type='text' name='user[verify-password]' value={userInfo.verifyPassword} onChange={handleChange} className='input validator w-full' placeholder='Enter password again' required />
                        <div className='validator-hint'>Please enter user's password</div>
                        {passwordError && <div className='text-error'>Passwords do not match</div>}
                   </fieldset>

                    <button
                        value='submit'
                        className='btn btn-sm btn-neutral text-neutral-content mt-4 w-max flex justify-self-end uppercase tracking-widest font-italiana font-extralight'
                    >
                        Update Password
                    </button>
                </form>
            </div>
        </dialog>
    );
};

export default ResetPasswordModal;