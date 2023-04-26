import React, { useContext, useEffect } from 'react';
import Category from '../components/Category';
import { AuthContext } from '../../shared/context/auth-context';
import { useHistory } from 'react-router-dom';

import { useSwipeable } from 'react-swipeable';

import './Categories.css';

const CollectionsHome = props => {
    const auth = useContext(AuthContext);
    let history = useHistory();

    const handlers = useSwipeable({
        onSwipedLeft: () => history.push('/party'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    return (
        <React.Fragment>
            <div className="content" {...handlers}>
                <div id="categories">
                    <Category id="movie" title="MOVIES" />
                    <Category id="tv" title="TV" />
                    <Category id="game" title="GAMES" />
                </div>
            </div>
        </React.Fragment>
    );
}

export default CollectionsHome;