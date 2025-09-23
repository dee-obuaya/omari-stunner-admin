/* eslint-disable no-unused-vars */
import React, { useState, usEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SlHome, SlSettings, SlPicture, SlDirection, SlNotebook, SlMenu, SlDrawer, SlUser } from "react-icons/sl";

export default function Sidebar(props) {
    const {content} = props;
    const [activeMenu, setActiveMenu] = useState('home');

    useEffect(() => {
        const currentActive = document.querySelector(activeMenu);
        currentActive?.classList.toggle('menu-active');
    }, []);

    const handleMenuClick = (e) => {
        const checkbox = document.getElementById('my-drawer');
        checkbox.checked = false;

        handleSettingActive(e.target.classList[0]);
    };

    const handleSettingActive = (menuItem) => {
        const oldActive = document.querySelector('.menu-active');
        if (oldActive) {
            oldActive?.classList.toggle('menu-active');
        };

        setActiveMenu(menuItem);

        switch (menuItem) {
            case 'home':
                document.querySelector('.home')?.classList.toggle('menu-active');
                break;
            case 'services':
                document.querySelector('.services')?.classList.toggle('menu-active');
                break;
            case 'images':
                document.querySelector('.images')?.classList.toggle('menu-active');
                break;
            case 'tabs':
                document.querySelector('.tabs')?.classList.toggle('menu-active');
                break;
            case 'bookings':
                document.querySelector('.bookings')?.classList.toggle('menu-active');
                break;
            case 'messages':
                document.querySelector('.messages')?.classList.toggle('menu-active');
                break;
            case 'users':
                document.querySelector('.users')?.classList.toggle('menu-active');
                break;
            default:
                document.querySelector('.home')?.classList.toggle('menu-active');
        };
    };

    return (
        <div className='drawer h-full'>
            <input id='my-drawer' type='checkbox' className='drawer-toggle' />
            <div className='drawer-content absolute min-h-screen pt-10 w-full'>
                {/* Page content here */}
                <label htmlFor='my-drawer' className='drawer-button bg-base-300 shadow-md rounded-md fixed top-18 left-0 p-2'>
                    <SlMenu className='text-lg' />
                </label>
                {content}
            </div>
            <div className='drawer-side'>
                <label htmlFor='my-drawer' aria-label='close sidebar' className='drawer-overlay'></label>
                <ul className='menu md:menu-md lg:menu-lg bg-base-200 text-base-content h-full w-52 p-4 pt-20 font-semibold font-libertinus tracking-wider uppercase space-y-3.5'>
                    {/* Sidebar content here */}
                    <li>
                        <Link to='/admin/home' onClick={handleMenuClick} className='home flex items-center space-x-5'>
                            <SlHome className='pb-0.5'/> Home
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/services' onClick={handleMenuClick} className='services flex items-center space-x-5'>
                            <SlSettings className='pb-0.5'/> Services
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/images' onClick={handleMenuClick} className='images flex items-center space-x-5'>
                            <SlPicture className='pb-0.5'/>Images
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/tabs' onClick={handleMenuClick} className='tabs flex items-center space-x-5'>
                            <SlDirection className='pb-0.5'/>Tabs
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/bookings' onClick={handleMenuClick} className='bookings flex items-center space-x-5'>
                            <SlNotebook className='pb-0.5'/>Bookings
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/messages' onClick={handleMenuClick} className='messages flex items-center space-x-5'>
                            <SlDrawer className='pb-0.5'/>Messages
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/users' onClick={handleMenuClick} className='users flex items-center space-x-5'>
                            <SlUser className='pb-0.5'/>Users
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};