import React from 'react';
import { NavLink } from 'react-router-dom';
import Footer from '../../shared/components/Navigation/Footer';

import './PartyHome.css';
import Button from '../../shared/components/FormElements/Button';

const PartyHome = props => {
    return (
        <React.Fragment>
            <div className='content'>
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