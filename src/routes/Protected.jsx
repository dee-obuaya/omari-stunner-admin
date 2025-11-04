// PrivateRoute.js
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loader from '../components/Loader';

const Protected = () => {
    const {isAuthenticated, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return(
            <Loader size='xl' tip='Getting things ready...' />
        )
    }

    if (!isAuthenticated) {
        return <Navigate to='/login' state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default Protected;