/* eslint-disable no-unused-vars */
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import useSessionMonitor from '../hooks/useSessionMonitor';

export default function SessionManager()  {
    const { logout, sessionExpiry, isAuthenticated } = useAuth();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const location = useLocation();

    useSessionMonitor();

    useEffect(() => {
        // console.log('Session Manager here!');
        if (!isAuthenticated || !sessionExpiry) return;
        const remainingTime = sessionExpiry - Date.now();

        if (remainingTime <= 0) {
            endSession();
            return;
        }

        // auto logout timer
        const timer = setTimeout(() => {
            endSession();
        }, remainingTime);

        return () => {
            clearTimeout(timer);
            // clearInterval(interval);
        }
    }, [showAlert, sessionExpiry, isAuthenticated, navigate, logout]);

    const endSession = () => {
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
    };

    return null; // it's an invisible helper component
};