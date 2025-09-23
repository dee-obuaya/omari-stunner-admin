import React, {useEffect, useState} from 'react';
import { useRouteError } from 'react-router';
import { FaCircleExclamation, FaExclamation } from "react-icons/fa6";
import { Link } from 'react-router';

export default function ErrorPage() {
    const error = useRouteError();
    console.log(error)

    const icons = [FaExclamation, FaCircleExclamation];
    const [icon, setIcon] = useState(null);

    let randomNumber = Math.floor(Math.random() * 10) + 1;

    useEffect(() => {
        const selectedIcon = chooseIcon(randomNumber);
        setIcon(selectedIcon);
    }, []);

    const chooseIcon = (num) => {
        let isEven = num % 2 === 0;

        return isEven ? icons[0] : icons[1];
    };

    return (
        <div id='error-page' className='h-full flex justify-center items-center'>
            <div className='space-y-2'>
                <div className='text-4xl flex justify-center animate-bounce'>
                    {icon}
                </div>

                <div className='space-y-1.5'>
                    <div className='text-center'>
                        <h1 className='font-italiana text-2xl tracking-widest uppercase'>Oops!</h1>
                    </div>
                    <div className='text-center'>
                        <p className='font-niconne text-base tracking-wider'>Sorry, an unexpected error has occurred.</p>
                        <i className='font-libertinus text-sm tracking-widest'>{error?.statusText || error?.message || 'Please try again'}</i>
                    </div>

                    <div>
                        <Link to='/home'></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
