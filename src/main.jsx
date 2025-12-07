/* eslint-disable no-unused-vars */
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import MainApp from './routes'
import ErrorPage from './error'
import Protected from './routes/Protected'
import Public from './routes/Public'
import Login from './routes/Login'
import Home from './routes/Home'
import Images from './routes/Images'
import Tabs from './routes/Tabs'
import Services from './routes/Services'
import Bookings from './routes/Bookings'
import Users from './routes/Users'
import Messages from './routes/Messages'
import Chats from './routes/Chats'
import { AuthProvider } from './contexts/AuthContext'
import { AlertProvider } from './contexts/AlertContext'


const router = createBrowserRouter([
    {
        element: <Public />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <Navigate to='/login' replace />,
            },
            {
                path: '/login',
                element: <Login />
            }
        ]
    },
    {
        path: '/admin',
        errorElement: <ErrorPage />,
        element: <Protected />,
        children: [
            {
                element: <MainApp />,
                children: [
                    {
                        index: true,
                        element: <Navigate to='home' replace />,
                    },
                    {
                        path: 'home',
                        element: <Home />,
                    },
                    {
                        path: 'images',
                        element: <Images />,
                    },
                    {
                        path: 'tabs',
                        element: <Tabs />,
                    },
                    {
                        path: 'services',
                        element: <Services />,
                    },
                    {
                        path: 'bookings',
                        element: <Bookings />,
                    },
                    {
                        path: 'users',
                        element: <Users />,
                    },
                    {
                        path: 'messages',
                        element: <Messages />,
                    },
                    {
                        path: 'chats',
                        element: <Chats />
                    }
                ]
            }
        ],
    },
    {
        path: '*',
        element: <ErrorPage />,
    },
]);


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AlertProvider>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </AlertProvider>
    </StrictMode>,
)
