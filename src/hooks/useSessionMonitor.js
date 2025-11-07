// hooks/useSessionMonitor.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';

export default function useSessionMonitor(interval = 2 * 60 * 1000) {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const {isAuthenticated, checkSession, logout, sessionExpiry} = useAuth();

    useEffect(() => {
        // Check on mount
        checkSession();

        // Then every few minutes
        const intervalId = setInterval(async () => {
            const stillValid = await checkSession();

            if (!stillValid) {
                showAlert('warning', 'Your session has expired. Please log in again.');
                logout(true);
                navigate('/login');
            }
        }, interval);

        // Also check when tab regains focus
        const handleFocus = async () => {
            const stillValid = await checkSession();

            if (!stillValid) {
                showAlert('warning', 'Your session has expired. Please log in again.');
                logout(true);
                navigate('/login');
            }
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
        };
    }, [showAlert, logout, navigate, isAuthenticated, sessionExpiry, checkSession]);
}
