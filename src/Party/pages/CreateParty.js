import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import Footer from '../../shared/components/Navigation/Footer';

import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import back from '../../shared/assets/img/back.svg';

import './CreateParty.css';
import Button from '../../shared/components/FormElements/Button';

// TODO: Update to use radio button to select media type. Based on current media type fetch the collections

const CreateParty = props => {

    const [collections, setCollections] = useState([]);
    let history = useHistory();

    useEffect(() => {
        // TODO: This will be replaced by searching the collections from the backend

        // Set the collections to the default values
        setCollections([
            { id: 1, name: "Watch Later", selected: false }, 
            { id: 2, name: "Netflix", selected: false }, 
            { id: 3, name:"Disney Plus", selected: false}, 
            { id: 4, name:"HBO Max", selected: false }, 
            { id: 5, name:"Peacock", selected: false }, 
            { id: 6, name:"VUDU", selected: false },
        ]);

        // Fetch collections from the backend and set them to the state
        // TODO: Add back once backend is ready
        // fetch('http://localhost:5000/api/collections')
        // .then(response => response.json())
        // .then(res => {
        //     // Add selected to each collection
        //     res.collections.forEach(collection => {
        //         collection.selected = false;
        //     });

        //     setCollections(res.collections);
        // });
    }, []);

    const addRemoveItem = (itemId) => {
        // Find the item in the array and toggle the selected value
        const updatedCollections = collections.map(collection => {
            if(collection.id === itemId) {
                collection.selected = !collection.selected;
            }
            return collection;
        });

        setCollections(updatedCollections);
    }

    const navToParty = () => {
        // Generate a random 4 digit party code
        const partyCode = Math.floor(1000 + Math.random() * 9000);

        // Route to the party page and pass the selected collections
        history.push({
            pathname: `/party/${partyCode}/owner`,
        });

        // TODO: Update to send the selected collections to the backend to create party with join code and then route to the party page
        // make a post request to the backend to create the party with the join code and then route to the party page
        // fetch('http://localhost:5000/api/createParty', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         collections: collections.filter(collection => collection.selected)
        //     })
        // })
        // .then(response => response.json())
        // .then(res => {
        //     // Route to the party page
        //     history.push({
        //         pathname: `/party/${res.partyCode}/owner`,
        //     });
        // });
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
                        <div key={collection.id} className='create-party-collection'>
                            {
                                collection.selected 
                                    ? (<img id={ collection.id } src={check} className='create-party-selectable' onClick={() => { addRemoveItem(collection.id) }} />) 
                                    : (<img id={ collection.id } src={circle} className='create-party-selectable' onClick={() => { addRemoveItem(collection.id) }} />)
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