/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import Loader from '../../components/Loader';
import ThemeToggler from '../../components/ThemeToggler'

const Login = () => {
    const {isAuthenticated, login} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {showAlert} = useAlert();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 500);

        if (location.state?.alert) {
            console.log(alert);
            showAlert(location.state.alert);
        }

        return () => clearTimeout(timer);
    }, []);

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

        const user = {username: username, password: password};

        const redirectTo = location.state?.from?.pathname || '/admin/home';


        try {
            await login(user);
            navigate(redirectTo, {replace: true});
        } catch (e) {
            console.error(e);
            showAlert({type: 'warning', message: e.message || 'Login failed'})
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ThemeToggler />

            <motion.div
                initial={{scale: 0, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                className={`transition-all ease-initial duration-700 flex flex-col h-full items-center justify-center overflow-y-hidden ${visible ? 'opacity-100 mx-5 md:mx-8 lg:mx-14' : 'opacity-0'}`}
            >
                {/* {showAlert && <Alert type={alert.type} message={alert.message} />} */}

                <div className='card border border-base-300 w-fit justify-self-center self-center shadow-xl'>
                    <div className='card-body'>
                        <h2 className='card-title text-xl font-italiana font-semibold tracking-wider lg:max-w-3/4 md:mx-auto lg:px-5'>Hi! Login to continue</h2>
                        <form id='form' className='my-4 px-4 md:px-8 lg:px-0 lg:mx-auto font-libertinus tracking-widest space-y-5' onSubmit={handleLogin}>
                            {/* <h3 className='font-bold text-lg mb-4'>Add New Service</h3> */}
                            <fieldset className='fieldset lg:max-w-3/4 md:mx-auto lg:px-10'>
                                <legend className='fieldset-legend text-base'>Username</legend>
                                <input type='text' name='username' value={username} onChange={handleChange} className='input validator' placeholder='Username' required />
                                <div className='validator-hint'>Please enter username</div>

                                <legend className='fieldset-legend text-base'>Password</legend>
                                <input type='text' name='password' value={password} onChange={handleChange} className='input validator' placeholder='Password' required />
                                <div className='validator-hint'>Please enter password</div>
                            </fieldset>

                            <button
                                value='submit'
                                className='btn btn-sm btn-neutral text-neutral-content mt-4 w-max flex justify-self-end uppercase tracking-widest font-italiana font-bold'
                                disabled={loading}
                            >
                                {loading ? (<Loader size='sm' />) : (<>Log In <LogIn className='w-4 h-4' /></>)}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default Login;