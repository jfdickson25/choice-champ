import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import back from '../../shared/assets/img/back.svg';

import './CreateParty.css';
import Button from '../../shared/components/FormElements/Button';

import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';

// TODO: Update to use radio button to select media type. Based on current media type fetch the collections

const CreateParty = props => {
    const auth = useContext(AuthContext);

    const [collections, setCollections] = useState([]);
    const [mediaType, setMediaType] = useState('movie');
    const [selectAlert, setSelectAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [secretMode, setSecretMode] = useState(false);
    const [includeWatched, setIncludeWatched] = useState(false);
    let history = useHistory();

    useEffect(() => {
        auth.showFooterHandler(true);
        // TODO: Update to only search for collection after radio button is selected
        // Make a fetch post request to localhost:5000/collections with the userId and setCollections to the response
        fetch(`https://choice-champ-backend.glitch.me/collections/movie/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setCollections(data.collections);
            setIsLoading(false);
        })
    }, []);

    const addRemoveItem = (itemId) => {
        if(selectAlert) {
            setSelectAlert(false);
        }

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
        const selectedCollections = collections.filter(collection => collection.selected);

        if (selectedCollections.length === 0) {
            setSelectAlert(true);
            return;
        }

        // Generate a random 4 digit party code
        const partyCode = Math.floor(1000 + Math.random() * 9000);

        const collectionIds = selectedCollections.map(collection => collection._id);

        // TODO: Update to send the selected collections to the backend to create party with join code and then route to the party page
        // make a post request to the backend to create the party with the join code and then route to the party page
        fetch('https://choice-champ-backend.glitch.me/party', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                    collections: collectionIds,
                    partyCode: partyCode,
                    mediaType: mediaType,
                    secretMode: secretMode,
                    includeWatched: includeWatched,
            })
        })
        .then(res => {
            // Route to the party page
            history.push({
                pathname: `/party/${partyCode}/owner`,
            });
        });
    }

    const navBack = () => {
        history.push('/party');
    }

    const mediaTypeHandler = (event) => {

        setIsLoading(true);
        setMediaType(event.target.value);

        // Make a fetch post request to localhost:5000/collections with the userId and setCollections to the response
        fetch(`https://choice-champ-backend.glitch.me/collections/${event.target.value}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setCollections(data.collections);
            setIsLoading(false);
        })
    }

    return (
        <React.Fragment>
            <div className='content'>
                <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
                <h2 className='title'>Create Party</h2>
                <div className='secret-mode'>
                    <p>Secret Mode</p>
                    <img src={ secretMode ? check : circle } onClick={() => { setSecretMode(!secretMode) }} />
                </div>
                <div className='include-watched'>
                    <p>Include Watched</p>
                    <img src={ includeWatched ? check : circle } onClick={() => { setIncludeWatched(!includeWatched) }} />
                </div>
                <div className='divider'></div>
                <div className='radio-btns'>
                    <label htmlFor="movie">Movies</label>
                    <input type='radio' name='mediaType' id='movie' value='movie' onChange={mediaTypeHandler} checked={mediaType === 'movie'} /> 
                    <label htmlFor="tv">TV Shows</label>
                    <input type='radio' name='mediaType' id='tv' value='tv' onChange={mediaTypeHandler} checked={mediaType === 'tv'} />
                    <label htmlFor="games">Video Games</label>
                    <input type='radio' name='mediaType' it='games' value='game' onChange={mediaTypeHandler} checked={mediaType === 'game'} />
                </div>
                <div className='create-party-collections'>
                { isLoading ? <Loading type='beat' className='list-loading-create' size={20} /> : 
                        collections.length > 0 ?
                            collections.map(collection => (
                                <div key={collection._id} className='create-party-collection'>
                                    <img id={ collection._id } src={ collection.selected ? check : circle} className='create-party-selectable' onClick={() => { addRemoveItem(collection._id) }} />
                                    <div className='create-party-collection-name'>{collection.name}</div>
                                </div>
                        ))
                        : <div className='no-collections-found'>No collections found for this media type</div>
                }
                </div>
                <Button type="button" className='create-party-btn' onClick={navToParty}>Create Party</Button>
                { selectAlert && <div className='select-alert'>Please select at least one collection</div> }
            </div>
        </React.Fragment>
    );
}

export default CreateParty;