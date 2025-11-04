import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loader from '../components/Loader';

const Public = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <Loader size='xl' tip='Just a moment...' />
        );
    }

    if (isAuthenticated) {
        return <Navigate to='/admin/home' replace />;
    }

    return <Outlet />;
};

export default Public;
