/* eslint-disable no-unused-vars */
// hooks/useSessionMonitor.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';

export default function useSessionMonitor(interval = 2 * 60 * 1000) {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const {isAuthenticated, checkSession, logout, sessionExpiry} = useAuth();

    const checkAndRefresh = async () => {
        try {
            const valid = await checkSession();

            if (!valid) {
                showAlert({type: 'warning', message: 'Your session has expired.Please log in again.'});
                logout(true);
                return;
            }

            // if session still valid, extend expiry silently
            await fetch('http://localhost:5000/auth/refresh', {credentials: 'include'})
        } catch (e) {
            console.error('Session check/refresh failed: ', e);
        }
    };

    function debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        // Check on mount
        checkSession();

        ['click', 'mousemove', 'keydown'].forEach(event => {
            window.addEventListener(event, debounce(checkAndRefresh, 60000)); // once per minute
        });

        window.addEventListener('focus', checkAndRefresh);


        // // Then every few minutes
        // const intervalId = setInterval(async () => {
        //     const stillValid = await checkSession();

        //     if (!stillValid) {
        //         showAlert('warning', 'Your session has expired. Please log in again.');
        //         logout(true);
        //         navigate('/login');
        //     } else {
        //         console.log('Session refreshed');
        //     }
        // }, interval);

        // // Also check when tab regains focus
        // const handleFocus = async () => {
        //     const stillValid = await checkSession();

        //     if (!stillValid) {
        //         showAlert('warning', 'Your session has expired. Please log in again.');
        //         logout(true);
        //         navigate('/login');
        //     }
        // };

        return () => {
            // clearInterval(intervalId);
            window.removeEventListener('focus', checkAndRefresh);
        };
    }, [showAlert, logout, navigate, isAuthenticated, sessionExpiry, checkSession]);
}
