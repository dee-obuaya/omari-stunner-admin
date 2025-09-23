/* eslint-disable no-unused-vars */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import MainApp from './routes'
import ErrorPage from './error'
import Home from './routes/Home'
import Images from './routes/Images'
import Tabs from './routes/Tabs'
import Services from './routes/Services'
import Bookings from './routes/Bookings'
import Users from './routes/Users'
import Messages from './routes/Messages'

const router = createBrowserRouter([
    {
        id: 'main-app-id',
        Component: MainApp,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true, // This makes it the default child route
                element: <Navigate to='/admin/home' replace />, // Redirect to /home
            },
            {
                path: '/admin/home',
                Component: Home,
            },
            {
                path: '/admin/images',
                Component: Images,
            },
            {
                path: '/admin/tabs',
                Component: Tabs,
            },
            {
                path: '/admin/services',
                Component: Services,
            },
            {
                path: '/admin/bookings',
                Component: Bookings,
            },
            {
                path: '/admin/users',
                Component: Users,
            },
            {
                path: '/admin/messages',
                Component: Messages,
            }
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
