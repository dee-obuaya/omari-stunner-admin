/* eslint-disable no-unused-vars */
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';

export default function useSessionMonitor() {
    const { showAlert } = useAlert();
    const {isAuthenticated, checkSession, logout} = useAuth();
    const refreshTimer = useRef(null);

    const isDev = import.meta.env.MODE === 'development';

    const logDev = (...args) => {
        if (isDev) console.log('[SessionMonitor]', ...args);
    }

    const checkAndRefresh = async (reason='interval') => {
        try {
            logDev(`Checking session(${reason})...`)
            const valid = await checkSession(true, true);

            if (!valid) {
                logDev('Session expired - logging out');
                showAlert({type: 'warning', message: 'Your session has expired. Please log in again.'});
                logout(true);
                return;
            } else{
                logDev('Session valid; refreshed successfully');
            }
        } catch (e) {
            console.error('Session check/refresh failed: ', e);
        }
    };

    const debounce = (fn, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        let interval;

        // run on mount and when tab regains focus
        checkAndRefresh();
        window.addEventListener('focus', checkAndRefresh);

        const debouncedRefresh = debounce(checkAndRefresh, 120000);
        ['click', 'mousemove', 'keydown'].forEach(event =>
            window.addEventListener(event, debouncedRefresh)
        );

        // check every 5 min
        refreshTimer.current = setInterval(checkAndRefresh, 1000 * 60 * 5);


        return () => {
            clearInterval(refreshTimer.current);
            window.removeEventListener('focus', checkAndRefresh);
            ['click', 'mousemove', 'keydown'].forEach(event =>
                window.removeEventListener(event, debouncedRefresh)
            );
        };
    }, []);
}
