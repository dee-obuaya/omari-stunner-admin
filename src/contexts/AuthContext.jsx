/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAlert } from './AlertContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpiry, setSessionExpiry] = useState(null);
    const timeoutRef = useRef(null);
    const {showAlert} = useAlert();

    // 🪄 On mount, check localStorage
    useEffect(() => {
        checkSession();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, []);

    const checkSession = async() => {
        try {
            const res = await fetch('http://localhost:5000/auth/check', {
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.user) {
                setIsAuthenticated(true);
                setUser(data.user);
                scheduleAutoLogout(data.maxAge || (1000 * 60 * 5));
                localStorage.setItem('user', JSON.stringify(data.user));
            } else {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (err) {
            console.error('Session check failed:', err);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const scheduleAutoLogout = (maxAge) => {
        if (timeoutRef.current) clearTimeout(timeoutRef);
        if (!maxAge) return;

        timeoutRef.current = setTimeout(() => {
            logout();
            showAlert('warning', 'Session expired. Please log in again.');
        }, maxAge);
        setSessionExpiry(Date.now() + maxAge);
    };

    const login = async (userData) => {
        const res = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: userData.username, password: userData.password}),
            credentials: 'include',
        });

        const response = await res.json();
        // console.log(response);

        if (!res.ok) {
            throw new Error(response.message || 'Login failed');
        }

        setIsAuthenticated(true);
        setUser(response.user);
        scheduleAutoLogout(response.maxAge);
        localStorage.setItem('user', JSON.stringify(response.user));
    };

    const logout = async (silent=false) => {
        try {
            await fetch('http://localhost:5000/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {
            console.error('Logout error: ', e);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('user');
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (!silent) console.log('User logged out');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, user, sessionExpiry }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
