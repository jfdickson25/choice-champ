import React, { useContext, useEffect } from 'react';
import Category from '../components/Category';
import { AuthContext } from '../../shared/context/auth-context';
import { useHistory } from 'react-router-dom';

import { useSwipeable } from 'react-swipeable';

import './Categories.css';

// DONE
const CollectionsHome = props => {
    const auth = useContext(AuthContext);
    let history = useHistory();

    const handlers = useSwipeable({
        onSwipedLeft: () => history.push('/party'),
        // preventDefaultTouchmoveEvent prevents the default touchmove event from firing. This is useful if you 
        // want to prevent scrolling of the page while swiping.
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
        // The delta property is the minimum distance in pixels before a swipe is detected.
        delta: 100
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
                    <Category id="board" title="BOARD" />
                </div>
            </div>
        </React.Fragment>
    );
}

export default CollectionsHome;