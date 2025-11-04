/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../AuthContext';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';

const Login = () => {
    const {isAuthenticated, login} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [alert, setAlert] = useState({type: '', message: ''});
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // If user is already logged in, skip login page
    if (isAuthenticated) {
        return <Navigate to='/admin/home' replace />;
    }

    const handleChange = (e) => {
        const {name, value} = e.target;

        if (name === 'username') setUsername(value);
        if (name === 'password') setPassword(value);
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);
        const redirectTo = location.state?.from?.pathname || '/admin/home';
        console.log(redirectTo);

        setTimeout(() => {
            login();
        }, 350);

        navigate(redirectTo, {replace: true}); // Redirect to the home page

        setLoading(false);
    };

    return (
        <div>
            <h2>Login</h2>
            {showAlert && <Alert type={alert.type} message={alert.message} />}
            <form id='form' className='my-4 px-4 md:px-8 lg:px-0 lg:mx-auto font-libertinus tracking-widest' onSubmit={handleLogin}>
                {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                <fieldset className='fieldset lg:max-w-3/4 md:mx-auto lg:px-10'>
                    <legend className='fieldset-legend text-base'>Username</legend>
                    <input type='text' name='username' value={username} onChange={handleChange} className='input validator w-full' placeholder='Username' required title='Only letters' />
                    <div className='validator-hint'>Please enter username</div>

                    <legend className='fieldset-legend text-base'>Password</legend>
                    <input type='text' name='password' value={password} onChange={handleChange} className='input validator w-full' placeholder='Password' required />
                    <div className='validator-hint'>Please enter password</div>
                </fieldset>

                <button
                    value='submit'
                    className='btn btn-sm btn-neutral text-neutral-content mt-4 w-max flex justify-self-end uppercase tracking-widest font-italiana font-extralight'
                    disabled={loading}
                >
                    {loading ? (<Loader size='xs' />) : (<>Log In <LogIn className='w-4 h-4' /></>)}
                </button>
            </form>
        </div>
    );
}

export default Login;