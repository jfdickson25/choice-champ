import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import { useHistory } from 'react-router-dom';

import { useSwipeable } from 'react-swipeable';

import './PartyHome.css';
import Button from '../../shared/components/FormElements/Button';

const PartyHome = props => {
    const auth = useContext(AuthContext);
    let history = useHistory();

    const handlers = useSwipeable({
        onSwipedLeft: () => history.push('/settings'),
        onSwipedRight: () => history.push('/collections'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
        delta: 100
    });

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    return (
        <React.Fragment>
            <div className='content' {...handlers}>
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
        </React.Fragment>
    );
}

export default PartyHome;