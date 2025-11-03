/* eslint-disable no-unused-vars */
import React, {useState, useEffect} from 'react';
import { motion } from 'motion/react';
import AddTabModal from './AddTabModal';
import EditTabModal from './EditTabModal';
import Table from '../../components/Table';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import ConfirmPopup from '../../components/ConfirmPopup';

const Tabs = () => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [tabs, setTabs] = useState([]);
    const [alert, setAlert] = useState({type: '', message: ''});
    const [showAlert, setShowAlert] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [tabToEdit, setTabToEdit] = useState({});
    const [tabToDelete, setTabToDelete] = useState({});
    const formData = new FormData();

    const columns = [
        { title: 'Name', dataId: 'name' },
        { title: 'Label', dataId: 'label' },
        {title: 'Status', dataId: 'active', render: (tab) => {
            return (
                <div
                    className={`badge badge-soft h-fit ${tab.row.original.active == true ? 'badge-success' : 'badge-error'}`}
                >
                    {tab.row.original.active == true ? 'Active' : 'Not Active'}
                </div>
            );
        }},
        {title: 'Actions', dataId: 'actions', render: (tab) => {
            // console.log(tab);
            return (
                <div className='flex space-x-4'>
                    <button
                        className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                        data-tip='Edit Tab'
                        onClick={()=> handleEditClick(tab.row.original)}
                    >
                        <SlPencil className='text-lg' />
                    </button>

                    <ConfirmPopup
                        trigger={
                            <button
                                className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                                data-tip='Delete Tab'
                            >
                                <SlTrash className='text-lg' />
                            </button>
                        }
                        title='Delete Tab'
                        message={`Are you sure you want to delete the ${tab.row.original.label} tab? This action cannot be undone.`}
                        confirmText='Yes, Delete'
                        cancelText='Cancel'
                        onConfirm={() => handleDeleteClick(tab.row.original)}
                        canCancel={true}
                    />
                </div>
            )
        }}
    ];

    useEffect(() => {
        let visibilityTimer;
        const timer = setTimeout(() => {
            getTabs();
            visibilityTimer = setTimeout(() => {
                setVisible(true);
            }, 500);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    const getTabs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/tabs');
            if (response.ok) {
                const data = await response.json();
                setTabs(data);
            };
        } catch (error) {
            console.error('Error fetching tabs:', error);
            setAlert({type: 'error', message: 'Failed to fetch tabs.'});
            setShowAlert(true);
        } finally {
            setLoading(false);
            setTimeout(() => setShowAlert(false), 3000)
        };
    };

    const handleEditClick = (tab) => {
        // console.log('Tab to edit: ', tab);
        setIsEditModalOpen(true);
        setTabToEdit({...tab});
        setTimeout(() => {
            document.getElementById('edit-tab-modal').showModal()
        }, 200);
    };

    const handleCloseModal = () => {
        if (isAddModalOpen) {
            setIsAddModalOpen(false);
        } else if (isEditModalOpen) {
            setIsEditModalOpen(false);
            setTabToEdit({});
        };
    };

    const handleDeleteClick = (tab) => {
        // console.log('Tab to delete: ', tab);
        setTabToDelete({...tab});
        setTimeout(() => {
            deleteTab();
        }, 200);
    };

    const addNewTab = async (data) => {
        formData.append('name', data.name);
        formData.append('label', data.label);

        try {
            const response = await fetch('http://localhost:5000/api/tabs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString(),
            });
            const data = await response.json();

            if (!response.ok) {
                setAlert({type: 'error', message: data.message || data.statusText || 'Failed to add new tab.'});
                setShowAlert(true);
                return;
            };

            // console.log(data);
            if (data.tab) {
                setAlert({type: 'success', message: data.message});
                setShowAlert(true);
                // handleCloseModal();
                getTabs();
            } else {
                setAlert({type: 'error', message: 'Failed to add new tab.'});
                setShowAlert(true);
            };
        } catch (error) {
            console.error('Error adding new tab:', error);
            setAlert({type: 'error', message: 'Error adding new tab.'});
            setShowAlert(true);
        } finally {
            handleCloseModal();
            setTimeout(() => setShowAlert(false), 5000)
        };
    };

    const editTab = async (data) => {
        formData.append('name', data.name);
        formData.append('label', data.label);
        formData.append('active', data.active);

        try {
            const response = await fetch(`http://localhost:5000/api/tabs/${tabToEdit._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString(),
            });

            // console.log('response: ', response);
            const data = await response.json();
            // console.log('data: ', data);

            if (!response.ok) {
                setAlert({type: 'error', message: data.message|| data.statusText || 'Failed to update tab.'});
                setShowAlert(true);
                return;
            };

            if (data.tab) {
                setAlert({type: 'success', message: data.message});
                setShowAlert(true);
                handleCloseModal();
                getTabs();
            } else {
                setAlert({type: 'error', message: 'Failed to update tab.'});
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error updating tab:', error);
            setAlert({type: 'error', message: 'Error updating tab.'});
            setShowAlert(true);
        } finally {
            handleCloseModal();
            setTimeout(() => setShowAlert(false), 5000)
        };
    }

    const deleteTab = async () => {
        // console.log('Deleting tab: ', tabToDelete);
        try {
            const response = await fetch(`http://localhost:5000/api/tabs/${tabToDelete._id}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
            });

            const data = await response.json();

            if (!response.ok) {
                setAlert({type: 'error', message: data.message || 'Failed to delete tab.'});
                setShowAlert(true);
                return;
            };

            setAlert({type: 'success', message: data.message});
            setShowAlert(true);
            getTabs();
        } catch (error) {
            console.error('Error deleting tab:', error);
            setAlert({type: 'error', message: 'Failed to delete tab.'});
            setShowAlert(true);
        } finally {
            setTabToDelete(null);
            setTimeout(() => setShowAlert(false), 5000)
        };
    };

    return (
        loading ? (
            <Loader size='xl' />
        ) :
        (
            <>
                {showAlert && <Alert type={alert.type} message={alert.message} />}

                <div className={`transition-all ease-initial duration-700 ${visible ? 'opacity-100 mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14' : 'opacity-0'}`}>
                    <div className='space-y-0.5 mb-4'>
                        <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest'>Tabs</h1>
                        <p className='text-base font-libertinus tracking-wider text-neutral-500'>Manage tabs for pages available on the main website</p>
                    </div>

                    <div className='divider mt-0 mb-4'></div>

                    <div className='flex justify-end mb-4'>
                        <motion.button
                            initial={{scale: 0.9}}
                            whileHover={{scale: 1}}
                            whileTap={{scale: 0.85}}
                            transition={{duration: 0.4, delay: 0.25, ease: [0, 0.71, 0.2, 1.01],}}
                            className='btn btn-sm md:btn-md lg:btn-lg font-extralight font-libertinus tracking-widest uppercase flex items-center'
                            onClick={()=>{
                                setIsAddModalOpen(true);
                                setTimeout(() => document.getElementById('add-tab-modal').showModal(), 200);
                            }}
                        >
                        <SlPlus className='text-sm' /> New Tab
                        </motion.button>
                    </div>

                    <Table loading={loading} columns={columns} dataSource={tabs} tableKey='tabs' />

                    {isAddModalOpen && <AddTabModal submitNewTab={addNewTab} handleClose={handleCloseModal} />}
                    {isEditModalOpen && <EditTabModal tab={tabToEdit} submitUpdatedTab={editTab} handleClose={handleCloseModal} />}
                </div>
            </>
        )
    );
};

export default Tabs;