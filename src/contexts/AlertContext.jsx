import { createContext, useContext, useState, useCallback } from 'react';
import Alert from '../components/Alert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({ type: '', message: '', visible: false });

    const showAlert = useCallback(({type, message}) => {
        setAlert({ type: type, message: message, visible: true });
        // console.log('type: ', type);
        // console.log('message: ', message);

        // Auto-hide after a few seconds
        setTimeout(() => {
            setAlert(prev => ({ ...prev, visible: false }));
        }, 4000);
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, visible: false }));
    }, []);

    return (
            <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alert.visible && (
                <div className='fixed top-36 left-1/2 -translate-x-1/2 z-9999 w-3/4'>
                    <Alert type={alert.type} message={alert.message} />
                </div>
            )}
            </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);