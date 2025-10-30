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
    }, [activeMenu]);

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
            <div className='drawer-content absolute pt-10 w-full'>
                {/* Page content here */}
                <label htmlFor='my-drawer' className='transition-all ease-in-out duration-300 drawer-button bg-base-300 shadow-md rounded-md fixed top-18 left-0 p-2 cursor-pointer hover:bg-accent/35'>
                    <SlMenu className='text-lg' />
                </label>
                {content}
            </div>
            <div className='drawer-side'>
                <label htmlFor='my-drawer' aria-label='close sidebar' className='drawer-overlay'></label>

                <ul className='menu md:menu-md lg:menu-lg bg-base-200 text-base-content h-full w-52 p-4  font-semibold font-libertinus tracking-wider uppercase space-y-3.5'>
                    <div className='flex items-center'>
                        <img src='/images/os_logo_full.png' alt='Omari Stunner Makeup Artist' />
                    </div>
                    <div className='divider'></div>

                    {/* Sidebar content here */}
                    <li>
                        <Link to='/admin/home' onClick={handleMenuClick} className='home flex items-center'>
                            <SlHome className='pb-0.5 mr-3.5'/> Home
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/services' onClick={handleMenuClick} className='services flex items-center'>
                            <SlSettings className='pb-0.5 mr-3.5'/> Services
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/images' onClick={handleMenuClick} className='images flex items-center'>
                            <SlPicture className='pb-0.5 mr-3.5'/>Images
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/tabs' onClick={handleMenuClick} className='tabs flex items-center'>
                            <SlDirection className='pb-0.5 mr-3.5'/>Tabs
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/bookings' onClick={handleMenuClick} className='bookings flex items-center'>
                            <SlNotebook className='pb-0.5 mr-3.5'/>Bookings
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/messages' onClick={handleMenuClick} className='messages flex items-center'>
                            <SlDrawer className='pb-0.5 mr-3.5'/>Messages
                        </Link>
                    </li>
                    <li>
                        <Link to='/admin/users' onClick={handleMenuClick} className='users flex items-center'>
                            <SlUser className='pb-0.5 mr-3.5'/>Users
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};