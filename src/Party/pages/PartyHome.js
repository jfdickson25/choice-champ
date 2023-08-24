import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';

import './PartyHome.css';
import Button from '../../shared/components/FormElements/Button';

const PartyHome = props => {
    const auth = useContext(AuthContext);

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    return (
        <React.Fragment>
            <div className='content'>
                <img src="https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/choice-party.svg?v=1681657279405" className="party-img" alt='Movie night'/>
                <NavLink to="/party/createParty" className='party-home'>
                    <Button className="party-btn" type="button">Create Party</Button>
                </NavLink>
                <NavLink to="/party/joinParty" className='party-home'>
                    <Button className="party-btn" type="button">Join Party</Button>
                </NavLink>
            </div>
        </React.Fragment>
    );
}

export default PartyHome;