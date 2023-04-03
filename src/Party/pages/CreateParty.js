import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Footer from '../../shared/components/Navigation/Footer';

import back from '../../shared/assets/img/back.svg';

import './CreateParty.css';

// TODO: Update to use radio button to select media type. Based on current media type fetch the collections

const CreateParty = props => {

    const [collections, setCollections] = useState([]);

    useEffect(() => {
        // TODO: This will be replaced by searching the collections from the backend

        setCollections([
            { id: 1, name: "Watch Later" }, { id: 2, name: "Netflix" }, { id: 3, name:"Disney Plus" }, { id: 4, name:"HBO Max" }, { id: 5, name:"Peacock" }, { id: 6, name:"VUDU" }
        ]);
    }, []);

    return (
        <React.Fragment>
            <div className='content'>
                <NavLink to={'/party'} className="back">
                    <img src={back} alt="Back symbol" />
                </NavLink>
                <h2 className='title'>Create Party</h2>
                <div className='create-party-collections'>
                { 
                    collections.map(collection => (
                        <div key={collection.id} className='create-party-collection'>
                            <div className='create-party-selectable'>icon</div>
                            <div className='create-party-collection-name'>{collection.name}</div>
                        </div>
                    ))
                }
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
}

export default CreateParty;