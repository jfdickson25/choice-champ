import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import Button from '../../shared/components/FormElements/Button';

import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';
import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import movieNight from '../../welcome/assets/img/movie-night.svg';
import watch from '../../welcome/assets/img/watch.svg';

import './Settings.css';
import { Dialog } from '@mui/material';

const Settings = () => {
    const auth = useContext(AuthContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFlaticonModal, setShowFlaticonModal] = useState(false);
    const [showStorySetModal, setShowStorySetModal] = useState(false);

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    const openDeleteModal = () => {
        setShowDeleteModal(true);
    }

    const handleClose = () => {
        setShowDeleteModal(false);
    }

    const openFlaticonModal = () => {
        setShowFlaticonModal(true);
    }

    const handleCloseFlaticon = () => {
        setShowFlaticonModal(false);
    }

    const openStorySetModal = () => {
        setShowStorySetModal(true);
    }

    const handleCloseStorySet = () => {
        setShowStorySetModal(false);
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
                <div className='settings-attribution'>
                    <h1 className='settings-header'>Attribution</h1>
                    <img 
                        src='https://play-lh.googleusercontent.com/XXqfqs9irPSjphsMPcC-c6Q4-FY5cd8klw4IdI2lof_Ie-yXaFirqbNDzK2kJ808WXJk=w240-h480-rw' 
                        className='settings-attribution-logo' 
                    />
                    <p className='settings-attribution-text'>
                        This product uses TMDB API but is not endorsed or certified by TMDB. All movie and TV show data is provided by TMDB.
                    </p>
                    <img 
                        src='https://external-preview.redd.it/DGvb3twMxWmxD9UYoAR5gMnAerP0aftUTz0eMXVH-7I.jpg?auto=webp&s=a1b8547e2079191a18ab4d7c44d96d4ed977f2c3' 
                        className='settings-attribution-logo' 
                    />
                    <p className='settings-attribution-text'>This product uses Giant Bomb API but is not endorsed or certified by Giant Bomb. All video game data is provided by Giant Bomb</p>
                    <img 
                        src='https://images.squarespace-cdn.com/content/v1/5902292fd482e9284cf47b8d/1567633051478-PRQ3UHYD6YFJSP80U3YV/BGG.jpeg'
                        className='settings-attribution-logo' 
                    />
                    <p className='settings-attribution-text'>This product uses BoardGameGeek but is not endorsed or certified by BoardGameGeek. All board game data is provided by BoardGameGeek</p>
                    <img 
                        src='data:image/png;base64,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' 
                        className='settings-attribution-logo clickable'
                        onClick={openFlaticonModal}
                    />
                    <p className='settings-attribution-text'>
                        Many of the icons for this application were used from flaticon. For an exteded list of all icons please press the flaticon image to the left.
                    </p>
                    <img 
                        src='https://design.freepikcompany.com/media/img/logo/storyset/iso.svg' 
                        className='settings-attribution-logo clickable' 
                        onClick={openStorySetModal}
                    />
                    <p className='settings-attribution-text'>All illustrated imagery was used from Storyset. For an extensive list of all the illustrations used please press the image to the left.</p>
                    <h1 className='settings-header'>Reach out</h1>
                    <p id='email'>jfdickson25@gmail.com</p>
                    <p id='settings-attribution-text'>If you have any questions, comments, or requests please feel free to reach out to me at the email above.</p>
                </div>
                <Button className='btn-logout clickable' onClick={auth.logout}>Logout</Button>
                <Button className='btn-delete-settings clickable' onClick={openDeleteModal} backgroundColor='#b31212'>Delete Account</Button>
            </div>
            <Dialog open={showDeleteModal} onClose={handleClose} fullWidth maxWidth='lg'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <h2 className='modal-header'>Are you sure you want to delete your account?</h2>
                        <div className='dialog-buttons'>
                            <Button className='btn-cancel clickable' onClick={handleClose}>Cancel</Button>
                            <Button className='btn-delete clickable' onClick={deleteAccount} backgroundColor='#b31212'>Delete</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog open={showStorySetModal} onClose={handleCloseStorySet} fullWidth maxWidth='lg' scroll='body'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <h2 className='modal-header'>Storyset Attribution</h2>
                        <div className='storyset-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/choice-party.svg?v=1681657279405' />
                            <a href="https://storyset.com/people">People illustrations by Storyset</a>
                        </div>
                        <div className='storyset-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/join-code.svg?v=1681658134032' />
                            <a href="https://storyset.com/user">User illustrations by Storyset</a>
                        </div>
                        <div className='storyset-link'>
                            <img src={movieNight} />
                            <a href="https://storyset.com/people">People illustrations by Storyset</a>
                        </div>
                        <div className='storyset-link'>
                            <img src={watch} />
                            <a href="https://storyset.com/people">People illustrations by Storyset</a>
                        </div>
                        <div className='storyset-link'>
                            <img src="https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/waiting-screen.svg?v=1691033380153" />
                            <a href="https://storyset.com/people">People illustrations by Storyset</a>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog open={showFlaticonModal} onClose={handleCloseFlaticon} fullWidth maxWidth='lg' scroll='body'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <h2 className='modal-header'>Flaticon Attribution</h2>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/movie.png?v=1682271238203' />
                            <a href="https://www.flaticon.com/free-icons/video-production" title="video production icons">Video production icons created by Uniconlabs - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/tv.png?v=1682271238537' />
                            <a href="https://www.flaticon.com/free-icons/watching-tv" title="watching tv icons">Watching tv icons created by Dmytro Vyshnevskyi - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/game.png?v=1682271237845' />
                            <a href="https://www.flaticon.com/free-icons/gamer" title="gamer icons">Gamer icons created by VectorPortal - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/pawn.png?v=1691967359871' />
                            <a href="https://www.flaticon.com/free-icons/chess" title="chess icons">Chess icons created by dr.iconsart - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button.png?v=1702137134668' />
                            <a href="https://www.flaticon.com/free-icons/back-button" title="back button icons">Back button icons created by The Chohans - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/plus-button.png?v=1702138169050' />
                            <a href="https://www.flaticon.com/free-icons/read-more" title="read more icons">Read more icons created by Bharat Icons - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={edit} />
                            <a href="https://www.flaticon.com/free-icons/edit" title="edit icons">Edit icons created by iconixar - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button-active.png?v=1702137193420' />
                            <a href="https://www.flaticon.com/free-icons/back-button" title="back button icons">Back button icons created by The Chohans - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/plus-button-active.png?v=1702137827635' />
                            <a href="https://www.flaticon.com/free-icons/read-more" title="read more icons">Read more icons created by Bharat Icons - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={circle} />
                            <a href="https://www.flaticon.com/free-icons/circle" title="circle icons">Circle icons created by Freepik - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/left.png?v=1692161740511' />
                            <a href="https://www.flaticon.com/free-icons/back" title="back icons">Back icons created by Arkinasi - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/right.png?v=1692161745669' />
                            <a href="https://www.flaticon.com/free-icons/back" title="back icons">Back icons created by Arkinasi - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={editing} />
                            <a href="https://www.flaticon.com/free-icons/edit" title="edit icons">Edit icons created by iconixar - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433' />
                            <a href="https://www.flaticon.com/free-icons/delete" title="delete icons">Delete icons created by Pixel perfect - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={check} />
                            <a href="https://www.flaticon.com/free-icons/yes" title="yes icons">Yes icons created by juicy_fish - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/star.png?v=1699066109692' />
                            <a href="https://www.flaticon.com/free-icons/rating" title="rating icons">Rating icons created by Corner Pixel - Flaticon</a>
                        </div>
                    </div>
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default Settings;