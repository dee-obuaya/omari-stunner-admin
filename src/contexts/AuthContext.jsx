/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAlert } from './AlertContext';
import { API_BASE_URL } from '../constants/ServerUrl';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpiry, setSessionExpiry] = useState(null);
    const timeoutRef = useRef(null);
    const {showAlert} = useAlert();
    const socketRef = useRef(null);

    // 🪄 On mount, check localStorage
    useEffect(() => {
        checkSession();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, []);

    useEffect(() => {

        if (!user || user.role !== 'admin') return;


        const socket = io(API_BASE_URL, {
            auth: { role: 'admin' },
            withCredentials: true
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Admin socket connected:', socket.id);

            socket.emit('admin:connect');
        });

        socket.on('admin:status', (data) => {
            console.log('Admin status:', data);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user]);

    const checkSession = async(silent=false, refreshIfValid=false) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/check`, {
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.user) {
                setIsAuthenticated(true);
                setUser(data.user);
                scheduleAutoLogout(data.maxAge);
                localStorage.setItem('user', JSON.stringify(data.user));

                // if refresh is requested, quietly ping '/auth/refresh' to extend the session
                if (refreshIfValid) {
                    try {
                        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, { credentials: 'include' });
                        const refreshData =await refreshRes.json();

                        if (refreshRes.ok && refreshData.maxAge) {
                            updateSessionExpiry(refreshData.maxAge);
                        }
                    } catch (refreshErr) {
                        console.error('Session refresh failed: ', refreshErr);
                    }
                };

                return true;
            } else {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('user');
                return false
            }
        } catch (err) {
            console.error('Session check failed:', err);
            if (!silent) setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const scheduleAutoLogout = (maxAge) => {
        if (timeoutRef.current) clearTimeout(timeoutRef);
        if (!maxAge) return;

        // Calculate the exact expiry
        const expiryTime = Date.now() + maxAge;
        setSessionExpiry(expiryTime);

        // Show warning 1 minute before expiry (or configurable)
        const warningTime = expiryTime - (1000 * 60); // 1 min before
        const timeUntilWarning = warningTime - Date.now();

        if (timeUntilWarning > 0) {
            setTimeout(() => {
                showAlert('info', 'Your session will expire in 1 minute. Save your work or refresh.');
            }, timeUntilWarning);
        }

        timeoutRef.current = setTimeout(() => {
            logout();
            showAlert('warning', 'Session expired. Please log in again.');
        }, maxAge);
        setSessionExpiry(Date.now() + maxAge);
    };

    const login = async (userData) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
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
            await fetch(`${API_BASE_URL}/auth/logout`, {
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

    const updateSessionExpiry = maxAge => {
        if (!maxAge) return;
        setSessionExpiry(Date.now() + maxAge);
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, user, sessionExpiry, checkSession, updateSessionExpiry, socket: socketRef.current }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
