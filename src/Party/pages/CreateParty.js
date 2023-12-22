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
    const [superChoice, setSuperChoice] = useState(false);
    const [navingBack, setNavingBack] = useState(false);
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
            console.log(data.collections);
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

        const collectionIds = selectedCollections.map(collection => collection._id);

        fetch('https://choice-champ-backend.glitch.me/party', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                    collections: collectionIds,
                    mediaType: mediaType,
                    secretMode: secretMode,
                    includeWatched: includeWatched,
                    superChoice: superChoice,
                    owner: auth.userId
            })
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            // Route to the party page
            navigate(`/party/wait/${data.partyCode}`);
        });
    }

    const navBack = () => {
        setNavingBack(true);
        setTimeout(() => {
            setNavingBack(false);
            navigate('/party');
        }, 1000);
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
                {
                    navingBack ? 
                    (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button-active.png?v=1702137193420" alt="Back symbol" className="top-left clickable" style={{animation: 'button-press .75s'}} />) : 
                    (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button.png?v=1702137134668" alt="Back symbol" className="top-left clickable" onClick={navBack} />)
                }
                <h2 className='title'>Create Party</h2>
                <div className='create-divider'></div>
                <p className='option-text'>Secret Mode</p>
                <img className='option-img' src={ secretMode ? check : circle } onClick={() => { setSecretMode(!secretMode) }} />
                <p className='option-subtext'>Party members will not see each other's votes</p>                
                <p className='option-text'>Include Watched</p>
                <img className='option-img' src={ includeWatched ? check : circle } onClick={() => { setIncludeWatched(!includeWatched) }} />
                <p className='option-subtext'>Include items that have been marked as watched/played</p>  
                <p className='option-text'>Super Choice Mode</p>
                <img className='option-img' src={ superChoice ? check : circle } onClick={() => { setSuperChoice(!superChoice) }} />
                <p className='option-subtext'>
                    Super choice mode allows for more passionate voting. Double tap to star a choice to ensure it moves on to the next round.
                    All party members will see the star in subsequent rounds and it cannot be starred again.
                </p>  
                <div className='create-divider'></div>

                <p className='option-subtext'>Choose collection type for party</p> 
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
                                collection.items.length > 0 &&
                                <div key={collection._id} className='create-party-collection' onClick={() => { addRemoveItem(collection._id) }}>
                                    <img id={ collection._id } src={ collection.selected ? check : circle} className='create-party-selectable' />
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