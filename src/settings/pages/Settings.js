import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import Button from '../../shared/components/FormElements/Button';

import './Settings.css';
import { Dialog } from '@mui/material';

const Settings = props => {
    const auth = useContext(AuthContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    const openDeleteModal = () => {
        setShowDeleteModal(true);
    }

    const handleClose = () => {
        setShowDeleteModal(false);
    }

    const deleteAccount = () => {
        fetch(`https://choice-champ-backend.glitch.me/user/${auth.userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }

        })
        .then(res => {
            auth.logout(); 
        });
    }

    return (
        <React.Fragment>
            <div className="content">
                <div className='settings-home'>
                    <Button onClick={auth.logout}>Logout</Button>
                    <Button className='btn-delete' onClick={openDeleteModal}>Delete Account</Button>
                </div>
            </div>
            <Dialog open={showDeleteModal} onClose={handleClose} fullWidth maxWidth='lg'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <h2 className='delete-header'>Are you sure you want to delete your account?</h2>
                        <div className='dialog-buttons'>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button className='btn-delete' onClick={deleteAccount}>Delete</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default Settings;