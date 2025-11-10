/* eslint-disable no-unused-vars */
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import useSessionMonitor from '../hooks/useSessionMonitor';

export default function SessionManager()  {
    const { logout, sessionExpiry, isAuthenticated } = useAuth();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const location = useLocation();
    const logoutTimer = useRef(null);

    // hook handles session checks and refresh
    useSessionMonitor();

    const endSession = () => {
        if (!isAuthenticated) return;

        const currentPath = location.pathname;

        navigate('/login', {
            replace: true,
            state: {
                from: {pathname: currentPath},
                alert: { type: 'warning', message: 'Your session expired. Please log in again' },
                // expired: true,
            }
        });

        logout(true);
        showAlert({ type: 'warning', message: 'Your session expired. Please log in again' });
    };

    useEffect(() => {
        // console.log('Session Manager here!');
        if (!isAuthenticated || !sessionExpiry) return;

        // calculate remaining session time
        const remainingTime = sessionExpiry - Date.now();

        // if expired log out immediately
        if (remainingTime <= 0) {
            endSession();
            return;
        }

        // auto logout timer
        logoutTimer.current = setTimeout(() => {
            endSession();
        }, remainingTime);

        return () => {
            if (logoutTimer.current) clearTimeout(logoutTimer.current);
        }
    }, [sessionExpiry, isAuthenticated]);

    return null; // it's an invisible helper component
};