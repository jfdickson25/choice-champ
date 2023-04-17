import React from 'react';
import { NavLink } from 'react-router-dom';
import Footer from '../../shared/components/Navigation/Footer';

import discussion from '../assets/img/Group discussion-rafiki.svg';

import './PartyHome.css';
import Button from '../../shared/components/FormElements/Button';

const PartyHome = props => {
    return (
        <React.Fragment>
            <div className='content'>
                <img src="https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/choice-party.svg?v=1681657279405" className="party-img" alt='Movie night'/>
                <div className='party-home'>
                    <NavLink to="/party/createParty">
                        <Button type="button">Create Party</Button>
                    </NavLink>
                    <NavLink to="/party/joinParty">
                        <Button type="button">Join Party</Button>
                    </NavLink>
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
}

export default PartyHome;