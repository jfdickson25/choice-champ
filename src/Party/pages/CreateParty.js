import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import back from '../../shared/assets/img/back.svg';

import './CreateParty.css';
import Button from '../../shared/components/FormElements/Button';

import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';

const CreateParty = props => {
    const auth = useContext(AuthContext);

    const [collections, setCollections] = useState([]);
    const [mediaType, setMediaType] = useState('movie');
    const [selectAlert, setSelectAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [secretMode, setSecretMode] = useState(false);
    const [includeWatched, setIncludeWatched] = useState(false);
    let navigate = useNavigate();

    useEffect(() => {
        auth.showFooterHandler(true);
        // Make a fetch post request to collections with the userId and setCollections to the response
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

    const navToPartyWait = () => {
        const selectedCollections = collections.filter(collection => collection.selected);

        if (selectedCollections.length === 0) {
            setSelectAlert(true);
            return;
        }

        // Generate a random 4 digit party code
        const partyCode = Math.floor(1000 + Math.random() * 9000);

        const collectionIds = selectedCollections.map(collection => collection._id);

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
            navigate(`/party/wait/${partyCode}/owner`);
        });
    }

    const navBack = () => {
        navigate('/party');
    }

    const mediaTypeHandler = (event) => {

        setIsLoading(true);
        setMediaType(event.target.value);

        // Make a fetch post request to collections with the userId and setCollections to the response
        fetch(`https://choice-champ-backend.glitch.me/collections/${event.target.value}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setSelectAlert(false);
            setCollections(data.collections);
            setIsLoading(false);
        })
    }

    return (
        <React.Fragment>
            <div className='content'>
                <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
                <h2 className='title'>Create Party</h2>
                <div className='create-divider'></div>
                <p className='option-text'>Secret Mode</p>
                <img className='option-img' src={ secretMode ? check : circle } onClick={() => { setSecretMode(!secretMode) }} />
                <p className='option-subtext'>Party members will not see each other's votes</p>                
                <p className='option-text'>Include Watched</p>
                <img className='option-img' src={ includeWatched ? check : circle } onClick={() => { setIncludeWatched(!includeWatched) }} />
                <p className='option-subtext'>Include items that have been marked as watched/played</p>  
                <div className='create-divider'></div>

                <label className='radio-btn-label' htmlFor="movie">Movies</label>
                <input className='radio-btn' type='radio' name='mediaType' id='movie' value='movie' onChange={mediaTypeHandler} checked={mediaType === 'movie'} /> 
                <label className='radio-btn-label' htmlFor="tv">TV Shows</label>
                <input className='radio-btn' type='radio' name='mediaType' id='tv' value='tv' onChange={mediaTypeHandler} checked={mediaType === 'tv'} />
                <label className='radio-btn-label' htmlFor="games">Video Games</label>
                <input className='radio-btn' type='radio' name='mediaType' id='games' value='game' onChange={mediaTypeHandler} checked={mediaType === 'game'} />
                <label className='radio-btn-label' htmlFor="games">Board Games</label>
                <input className='radio-btn' type='radio' name='mediaType' id='board' value='board' onChange={mediaTypeHandler} checked={mediaType === 'board'} />
                
                <p className='option-subtext'>Choose collections to include in party</p>   
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
                <Button type="button" className='create-party-btn' onClick={navToPartyWait}>Create Party</Button>
                { selectAlert && <div className='select-alert'>Please select at least one collection</div> }
            </div>
        </React.Fragment>
    );
}

export default CreateParty;