/* eslint-disable no-unused-vars */
import React, {useState, useEffect, useRef} from 'react';
import { Outlet, useLocation, useRouteLoaderData } from 'react-router-dom';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SessionManager from '../components/SessionManager';

export default function MainApp() {
    const [loading, isLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const isMounted = useRef(false);

    useEffect(() => {

        isMounted.current = true;
        let timer;
        if (isMounted.current) {
            isLoading(false);
            timer = setTimeout(() => {
                setIsVisible(true);
            }, 750);
        };

        return () => {
            isMounted.current = false;
            clearTimeout(timer);
        }
    }, []);

    // Main component that serves as the root for the application
    // It can include a header, footer, or any other common elements

  return (
    loading ? (
        <Loader size='xl' />
    ) : (
            <div className={ `flex flex-col min-h-screen transition-all ease-in duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                {/* Header: name and theme toggle */}
                <div id='header' className='pb-1 sticky top-0 z-20 w-full shadow-md'>
                    <Header />
                </div>

                <SessionManager />

                {/* Content */}
                <div id='content' className='grow overflow-y-auto mb-8'>
                    {/* The Outlet component renders the child routes */}
                    <Sidebar content={<Outlet />} />
                    {/* <Outlet /> */}
                </div>

                {/* Footer: copyright */}
                <div id='footer' className='w-full bg-base-100'>
                    <Footer />
                </div>
            </div>
        )
    );
};