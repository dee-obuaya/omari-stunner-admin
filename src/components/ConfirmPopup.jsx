import React, { useEffect, useRef, useState } from 'react';
import { LiaCheckSolid, LiaTimesSolid } from 'react-icons/lia';
import Loader from './Loader';

const ConfirmPopup = ({
  trigger,             // React node you render that user clicks to open
  title = 'Are you sure?',
  message = '',
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm = () => {},
  onCancel = () => {},
  className = '',      // optional extra classes for styling
  // optionally whether clicking outside / Esc cancels the confirm
  canCancel = true,
}) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dialogRef = useRef(null);

    // optional: handle Esc key and clicking outside the modal-box to cancel
    useEffect(() => {
        if (!open) return;

        document.addEventListener('keydown', handleKey);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, canCancel, loading]);

    // Handle opening via JS, focusing etc
    const openDialog = () => {
        setOpen(true);
    };

    // Close popup
    const closeDialog = () => {
        if (loading) return; // prevent closing while loading
        setOpen(false);
        // call cancel if user closes by clicking outside/Esc, depending on canCancel
        onCancel();
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
        } catch (error) {
            console.error('Error in onConfirm:', error);
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Escape' && canCancel && !loading) {
            closeDialog();
        }
    };

    const handleClickOutside = (e) => {
        if (dialogRef.current) {
            // check if click target is outside modal-box
            const modalBox = dialogRef.current.querySelector('.modal-box');
            if (modalBox && !modalBox.contains(e.target) && canCancel && !loading) {
                closeDialog();
            }
        }
    };

    return (
        <>
            <span onClick={openDialog} className='inline-block'>
                {trigger}
            </span>

            {open && (
                <dialog
                ref={dialogRef}
                className={`modal transition-all duration-300 ${open ? 'opacity-100' : 'opacity-0'} ${className}`}
                open
                >
                <div className='modal-box'>
                    {title && <h3 className='font-bold text-lg'>{title}</h3>}
                    {message && <p className='py-4 text-wrap'>{message}</p>}
                    <div className='modal-action'>
                    <button
                        type='button'
                        className='btn btn-ghost'
                        onClick={closeDialog}
                        disabled={loading}
                    >
                        <LiaTimesSolid /> {cancelText}
                    </button>
                    <button
                        type='button'
                        className='btn btn-primary'
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader size='sm' />
                        ) : (
                            <>
                                <LiaCheckSolid /> {confirmText}
                            </>
                        )}
                    </button>
                    </div>
                </div>
                </dialog>
            )}
        </>
    );
};

export default ConfirmPopup;