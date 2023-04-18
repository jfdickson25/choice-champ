import React, { useContext, useEffect } from 'react';
import Category from '../components/Category';
import { AuthContext } from '../../shared/context/auth-context';

import './Categories.css';

const CollectionsHome = props => {
    const auth = useContext(AuthContext);

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    return (
        <React.Fragment>
            <div className="content">
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