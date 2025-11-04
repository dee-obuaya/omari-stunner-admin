/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import Table from '../../components/Table';
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import ConfirmPopup from '../../components/ConfirmPopup';

const Users = () => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [alert, setAlert] = useState({type: '', message: ''});
    const [showAlert, setShowAlert] = useState(false);
    const [isAddModalOpen,setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selected, setSelected] = useState({});
    const formData = new FormData();

    const columns = [
        {title: 'Name', dataId: 'name'},
        {title: 'Username', dataId: 'username'},
        {title: 'Actions', dataId: 'actions', render: (user) => {
            // console.log(tab);
            return (
                <div className='flex space-x-4'>
                    <button
                        className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                        data-tip='Edit User'
                        onClick={() => handleEditClick(user.row.original)}
                    >
                        <SlPencil className='text-lg' />
                    </button>

                    <ConfirmPopup
                        trigger={
                            <button
                                className='btn btn-ghost btn-xs sm:btn-sm md:btn-md lg:btn-lg p-2 tooltip tooltip-top'
                                data-tip='Delete User'
                            >
                                <SlTrash className='text-lg' />
                            </button>
                        }
                        title='Delete User'
                        message={`Are you sure you want to delete this user? This action cannot be undone.`}
                        confirmText='Yes, Delete'
                        cancelText='Cancel'
                        onConfirm={() => handleDeleteClick(user.row.original)}
                        canCancel={true}
                    />
                </div>
            )
        }}
    ];

    useEffect(() => {
        let visibilityTimer;
        const timer = setTimeout(() => {
            getUsers();
            visibilityTimer = setTimeout(() => {
                setVisible(true);
            }, 500);
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearTimeout(visibilityTimer);
        };
    }, []);

    const getUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            setAlert({type: 'error', message: 'Failed to fetch users.'});
            setShowAlert(true);
        } finally {
            setLoading(false);
            setTimeout(() => setShowAlert(false), 3000);
        };
    };

    const handleEditClick = user => {
        setSelected({...user});
        setIsEditModalOpen(true);
        setTimeout(() => {
            document.getElementById('edit-service-modal').showModal();
        }, 200);
    };

    const handleDeleteClick = user => {
        setSelected({...user});
        setTimeout(() => {
            deleteUser();
        }, 200);
    };

    const handleCloseModal = () => {
        if (isAddModalOpen) {
            setIsAddModalOpen(false);
        } else if (isEditModalOpen) {
            setIsEditModalOpen(false);
            setSelected({});
        }
    };

    const createUser = async (data) => {
        // formData.append('user', JSON.stringify(data.userInfo));

        try {
            const res = await fetch('http://localhost:5000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user: data.userDetails})
            })

            const response = await res.json();

            if (!res.ok) {
				console.log('response: ', response);
				setAlert({
					type: 'error',
					message:
						response.statusText ||
						response.message ||
						'Failed to create user.',
				});
				setShowAlert(true);
				return;
            }

			if (response.user) {
				setAlert({
					type: 'success',
					message:
						response.message ||
						`${response.user.name}'s credentials created successfully!`,
				});
				setShowAlert(true);
			} else {
				setAlert({ type: 'error', message: response.message });
				setShowAlert(true);
			}
        } catch (error) {
			console.error('Error:', error);
			setAlert({ type: 'error', message: `Error: ${error.message}` });
			setShowAlert(true);
		} finally {
			setTimeout(() => {
				setShowAlert(false);
			}, 5000);
			getUsers();
		}
    };

    const editUser = async (data) => {
        try {
			const res = await fetch(
				`http://localhost:5000/api/users/${selected._id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ user: data.userDetails }),
				}
			);

			const response = await res.json();

			if (!res?.ok) {
				console.log('response: ', response);
				setAlert({
					type: 'error',
					message:
						response.statusText ||
						response.message ||
						'Failed to update credentials.',
				});
				setShowAlert(true);
				return;
			}

			if (response?.user) {
				setAlert({
					type: 'success',
					message:
						response.message ||
						`${response.booking.name}'s credentials updated successfully!`,
				});
				setShowAlert(true);
			} else {
				setAlert({ type: 'error', message: response.message });
				setShowAlert(true);
			}
		} catch (error) {
			console.error('Error:', error);
			setAlert({ type: 'error', message: `Error: ${error.message}` });
			setShowAlert(true);
		} finally {
			setTimeout(() => {
				setShowAlert(false);
			}, 5000);
			getUsers();
		}
    };

    const deleteUser = async (data) => {
		try {
			const response = await fetch(
				`http://localhost:5000/api/bookings/${selected._id}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				setAlert({
					type: 'error',
					message: data.message || 'Failed to delete user.',
				});
				setShowAlert(true);
				return;
			} else {
				setAlert({ type: 'success', message: data.message });
				setShowAlert(true);
				getUsers();
			}
		} catch (error) {
			console.error('Error deleting user:', error);
			setAlert({ type: 'error', message: `Error: ${error}` });
			setShowAlert(true);
		} finally {
			setTimeout(() => {
				setShowAlert(false);
			}, 5000);
		}
    };

    return loading ? (
        <Loader size='xl' />
    ) : (
        <>
            {showAlert && <Alert type={alert.type} message={alert.message} />}

            <div
                className={`transition-all ease-initial duration-700 ${
                    visible
                        ? 'opacity-100 mt-10 md:mt-16 lg:mt-5 mx-5 md:mx-8 lg:mx-14'
                        : 'opacity-0'
                }`}>
                <div className='space-y-0.5 mb-4'>
                    <h1 className='text-2xl font-semibold font-italiana uppercase tracking-widest'>
                        Users
                    </h1>
                    <p className='text-base font-libertinus tracking-widest text-neutral-500'>
                        Manage users of the admin panel
                    </p>
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
                            setTimeout(() => {
                                document.getElementById('add-user-modal').showModal();
                            }, 100)
                        }}
                    >
                        <SlPlus className='text-sm' /> New User
                    </motion.button>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    pagination={{
                        totalItems: users?.length,
                    }}
                    tableKey='users'
                />

                {isAddModalOpen && (
                    <AddUserModal submitNewUser={createUser} handleClose={handleCloseModal} />
                )}
                {isEditModalOpen && (
                    <EditUserModal
                        user={selected}
                        submitUpdatedUser={editUser}
                        handleClose={handleCloseModal}
                    />
                )}
            </div>
        </>
    );
};

export default Users;