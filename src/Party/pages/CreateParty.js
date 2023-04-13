import React, { useEffect, useState, useContext } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import Footer from '../../shared/components/Navigation/Footer';

import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import back from '../../shared/assets/img/back.svg';

import './CreateParty.css';
import Button from '../../shared/components/FormElements/Button';

import { AuthContext } from '../../shared/context/auth-context';

// TODO: Update to use radio button to select media type. Based on current media type fetch the collections

const CreateParty = props => {
    const auth = useContext(AuthContext);

    const [collections, setCollections] = useState([]);
    let history = useHistory();

    useEffect(() => {
        // Make a fetch post request to localhost:5000/collections with the userId and setCollections to the response
        fetch(`http://localhost:5000/collections/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setCollections(data.collections);
        })
    }, []);

    const addRemoveItem = (itemId) => {
        // Find the item in the array and toggle the selected value
        const updatedCollections = collections.map(collection => {
            if(collection._id === itemId) {
                collection.selected = !collection.selected;
            }
            return collection;
        });

        setCollections(updatedCollections);
    }

    const navToParty = () => {
        // Generate a random 4 digit party code
        const partyCode = Math.floor(1000 + Math.random() * 9000);
        const selectedCollections = collections.filter(collection => collection.selected);

        const collectionIds = selectedCollections.map(collection => collection._id);

        // TODO: Update to send the selected collections to the backend to create party with join code and then route to the party page
        // make a post request to the backend to create the party with the join code and then route to the party page
        fetch('http://localhost:5000/party', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                    collections: collectionIds,
                    partyCode: partyCode
            })
        })
        .then(res => {
            // Route to the party page
            history.push({
                pathname: `/party/${partyCode}/owner`,
            });
        });
    }

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
                        <div key={collection._id} className='create-party-collection'>
                            {
                                collection.selected 
                                    ? (<img id={ collection._id } src={check} className='create-party-selectable' onClick={() => { addRemoveItem(collection._id) }} />) 
                                    : (<img id={ collection._id } src={circle} className='create-party-selectable' onClick={() => { addRemoveItem(collection._id) }} />)
                            }
                            <div className='create-party-collection-name'>{collection.name}</div>
                        </div>
                    ))
                }
                </div>
                <Button type="button" className='create-party-btn' onClick={navToParty}>Create Party</Button>
            </div>
            <Footer />
        </React.Fragment>
    );
}

export default CreateParty;