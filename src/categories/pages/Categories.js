import React from 'react';
import Footer from '../../shared/components/Navigation/Footer';
import Category from '../components/Category';

import './Categories.css';

const CollectionsHome = props => {
    return (
        <React.Fragment>
            <div className="content">
                <div id="categories">
                    <Category id="movies" title="MOVIES" />
                    <Category id="tv" title="TV" />
                    <Category id="games" title="GAMES" />
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
}

export default CollectionsHome;