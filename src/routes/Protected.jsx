/* eslint-disable no-unused-vars */
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
        return <Navigate to='/login' replace />;
        // state={{ from: location.state?.from?.pathname }}
    }

    return <Outlet />;
};

export default Protected;