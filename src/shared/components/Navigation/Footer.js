import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faCog, faUsers} from '@fortawesome/free-solid-svg-icons';
import React from 'react';

import './Footer.css';
import { NavLink } from 'react-router-dom';

const Footer = props => {
    return (
        <footer className='nav-links'>
            <div id='collections'>
                <NavLink to="/collections">
                    <FontAwesomeIcon icon={faLayerGroup} size="lg" />
                    <p className='footer-text'>Collections</p>
                </NavLink>
            </div>
            <div id='party'>
                <NavLink to="/party">
                    <FontAwesomeIcon icon={faUsers} size="lg" />
                    <p className='footer-text'>Party</p>
                </NavLink>
            </div>
            <div id='settings'>
                <NavLink to="/settings">
                    <FontAwesomeIcon icon={faCog} size="lg" />
                    <p className='footer-text'>Settings</p>
                </NavLink>
            </div>
        </footer>
    );
}

export default Footer;