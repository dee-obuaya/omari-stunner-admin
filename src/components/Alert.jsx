/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from 'motion/react';

const Alert = ({ type, message }) => {
    const getAlertClass = () => {
        switch (type) {
            case 'error':
                return 'alert-error';
            case 'success':
                return 'alert-success';
            case 'warning':
                return 'alert-warning';
            case 'info':
                return 'alert-info';
            default:
                return 'alert-info';
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.3, ease: 'easeInOut'}}
                role='alert' className={`alert alert-soft ${getAlertClass()} mb-4 w-1/2 flex justify-self-center`}>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
                <span>{message || 'Hello!'}</span>
            </motion.div>
        </AnimatePresence>
    );
};

export default Alert;