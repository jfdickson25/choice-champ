import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';

import './Details.css';
import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import back from '../../shared/assets/img/back.svg';

const Details = () => {
    const auth = useContext(AuthContext);
    let navigate = useNavigate();

    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our movies list
     ***********************************************************/
    // Grab the collection name and id from the parameters
    let collectionType = useParams().type;
    let collectionName = useParams().name;
    let collectionId = useParams().collectionId;
    let itemId = useParams().itemId;

    const [details, setDetails] = useState({});
    const [providers, setProviders] = useState({}); // List of providers to watch
    const [loading, setLoading] = useState(false); // Loading state for when we are fetching data
    const [navingBack, setNavingBack] = useState(false);
    const [orjCollectionList, setOrjCollectionList] = useState([]); // Original collection list to compare to the updated list
    const [collectionList, setCollectionList] = useState([]);
    const [loadingCollectionList, setLoadingCollectionList] = useState(false);
    const [updatesMade, setUpdatesMade] = useState(false);
    const [currentCollectionExists, setCurrentCollectionExists] = useState(true);

    useEffect(() => {
        auth.showFooterHandler(false);
        setLoading(true);
        setLoadingCollectionList(true);
        // Get all the items in the collection to check if any items in the search are already in the collection
        fetch(`https://choice-champ-backend.glitch.me/media/getInfo/${collectionType}/${itemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            // Remove all the html tags from the overview string
            // This is specifically for board games because the overview is in html
            if(collectionType === 'board') {
                const regex = /(<([^>]+)>)/gi;
                let string = data.media.details.overview.replace(regex, " ");
                let string2 = string.replace(/&mdash;/g, "-");
                let string3 = string2.replace(/&nbsp;/g, " ");
                let string4 = string3.replace(/&quot;/g, '"');
                let string5 = string4.replace(/&amp;/g, "&");
                let string6 = string5.replace(/&rsquo;/g, "'");
                
                data.media.details.overview = string6;
            }

            setDetails(data.media.details);

            if(collectionType !== 'board' || collectionType !== 'game') {
                // Set the providers to the providers object
                setProviders(data.media.providers);
            } 
            
            if (collectionType === 'game') {
                setProviders({
                    platforms: data.media.providers.platforms
                });
            }

            setLoading(false);
        });

        fetch(`https://choice-champ-backend.glitch.me/collections/collectionList/${collectionType}/${itemId}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            let tempCollectionArray = [];
            data.collections.forEach(collection => {
                tempCollectionArray.push(collection.exists);
            });

            setOrjCollectionList([...tempCollectionArray]);
            setCollectionList([...data.collections]);
            setLoadingCollectionList(false);
        });
    }, []);

    const navBack = () => {
        setNavingBack(true);
        setTimeout(() => {
            setNavingBack(false);
            if(currentCollectionExists) {
                navigate(`/collections/${collectionType}/${collectionName}/${collectionId}#${itemId}`);
            } else {
                navigate(`/collections/${collectionType}/${collectionName}/${collectionId}`);
            }
        }, 1000);
    }

    const submitCollectionUpdates = () => {
        setLoadingCollectionList(true);
        // Check to see if any collections were removed or added
        const removedCollections = [];
        const addedCollections = [];
        const tempOriginalList = [...orjCollectionList];
        const addedCollectionIndexes = [];

        for (let i = 0; i < collectionList.length; i++) {
            if(collectionList[i].exists !== tempOriginalList[i]) {
                if(collectionList[i].exists) {
                    addedCollections.push(collectionList[i]);
                    addedCollectionIndexes.push(i);
                    tempOriginalList[i] = true;

                } else {
                    removedCollections.push(collectionList[i]);
                    tempOriginalList[i] = false;
                }
            }
        }

        // Send a request to the backend to update the collections
        for (let i = 0; i < removedCollections.length; i++) {
            // Make a fetch delete request to remove an item from a collection
            fetch(`https://choice-champ-backend.glitch.me/collections/items/${removedCollections[i].collectionId}/${removedCollections[i].itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                // Update the collection list
                setOrjCollectionList([...tempOriginalList]);
                setLoadingCollectionList(false);
            });
        }

        for (let i = 0; i < addedCollections.length; i++) {
            // Make a fetch post request to add an item to a collection
            fetch(`https://choice-champ-backend.glitch.me/collections/items/${addedCollections[i].collectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{
                    title: details.title,
                    id: itemId,
                    poster: details.poster
                }])
            })
            .then(res => res.json())
            .then(data => {
                // Create a temp collection list to update the collection list
                // Update the collection list with the new item id
                let tempCollection = [...collectionList];
                tempCollection[addedCollectionIndexes[i]].itemId = data.newItems[0]._id;
                setCollectionList([...tempCollection]);
                // Update the collection list
                setOrjCollectionList([...tempOriginalList]);
                setLoadingCollectionList(false);
            });
        }
    }

    return (
        <div className='content'>
            <img 
                src={back} alt="Back symbol" className="top-left clickable" onClick={navBack}
                // Add a button-press animation when navigating back
                style={navingBack ? {animation: 'button-press .75s'} : null}
            />
            { 
                loading ? <Loading type='beat' className='list-loading' size={20} /> : 
                <React.Fragment>
                    <div id="content-details">
                        <img
                            className={ collectionType === 'game' ? 'details-img-game' :'details-img' }
                            src={details.poster}
                        />
                        <div className='details-title'>{details.title}</div>
                        {
                                <div className='details-section'>
                                    <span className='details-section-title'>
                                        { (collectionType === 'game' || collectionType === 'board') && ' Play Time:' } 
                                        { collectionType === 'movie' && ' Runtime:' }
                                        { collectionType === 'tv' && ' Seasons:' }
                                    </span> 
                                    {
                                        details.runtime > 0 ? details.runtime : 'N/A'
                                    }
                                    { (collectionType === 'game' && details.runtime > 0) && ' hour' } 
                                    { (collectionType === 'movie' || collectionType === 'board') && ' minute' } 
                                    { collectionType === 'tv' && ' season' }
                                    { details.runtime > 1 && 's' }
                                </div>
                        }
                        {
                            collectionType === 'board' && (
                                <React.Fragment>
                                    <div className='details-section'>
                                        <span className='details-section-title'>Min Players:</span> {details.minPlayers}
                                    </div>
                                    <div className='details-section'>
                                        <span className='details-section-title'>Max Players:</span> {details.maxPlayers}
                                    </div>
                                </React.Fragment>
                            )
                        }
                        <div className='details-section'>
                            <div className='details-section-title'>Overview:</div>
                            <div className='details-overview'>{details.overview}</div>
                        </div>

                        { 
                            
                            (collectionType === 'movie' || collectionType === 'tv') && 
                            (
                                <React.Fragment>
                                    <div className='details-provider-title'>Stream</div>
                                    { 
                                        // Q: How can I check to see if the providers.stream array is empty?
                                        // A: Use providers.stream.length
                                        providers.stream ?
                                        (
                                            <div className='details-provider-list'>
                                                {
                                                    providers.stream.map(provider => (
                                                        (<div className='details-provider-item' key={provider.provider_name}>
                                                            <img className='provider-img' src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`} alt={provider.provider_name} />
                                                        </div>)
                                                    ))
                                                }
                                            </div>
                                        ) : (
                                            <div className='providers-not-available'>Not available to stream</div>
                                        )
                                    }
                                    <div className='details-provider-title'>Buy</div>
                                    { 
                                        providers.buy ?
                                        (
                                            <div className='details-provider-list'>
                                                {
                                                    providers.buy.map(provider => (
                                                        (<div className='details-provider-item' key={provider.provider_name}>
                                                            <img className='provider-img' src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`} alt={provider.provider_name} />
                                                        </div>)
                                                    ))
                                                }
                                            </div>
                                        ) : (
                                            <div className='providers-not-available'>Not available to buy</div>
                                        )
                                    }
                                    {   collectionType === 'movie' && (
                                            <React.Fragment>
                                                <div className='details-provider-title'>Rent</div>
                                                { 
                                                    providers.rent ? 
                                                    (
                                                        <div className='details-provider-list'>
                                                            {
                                                                providers.rent.map(provider => (
                                                                    (<div className='details-provider-item' key={provider.provider_name}>
                                                                        <img className='provider-img' src={`https://image.tmdb.org/t/p/w500${provider.logo_path}`} alt={provider.provider_name} />
                                                                    </div>)
                                                                ))
                                                            }
                                                        </div>
                                                    ) : (
                                                        <div className='providers-not-available'>Not available to rent</div>
                                                    )
                                                }
                                            </React.Fragment>
                                        )
                                    }
                                </React.Fragment>
                            )
                        }
                        { 
                            
                            (collectionType === 'game') && 
                            (
                                <React.Fragment>
                                    <div className='details-provider-title'>Platforms</div>
                                    <div className='details-platforms'>
                                        {
                                            providers.platforms && (
                                                providers.platforms.map((platform, index) => (
                                                    (<span key={platform.platform.name}>
                                                        {
                                                            index === providers.platforms.length - 1 ? (
                                                                platform.platform.name
                                                            ) : 
                                                                platform.platform.name + ', '
                                                        }
                                                    </span>)
                                                ))
                                            )
                                        }
                                    </div>
                                        
                                </React.Fragment>
                            )
                        }
                    </div>
                </React.Fragment>
            }
            {
                !loadingCollectionList ?
                    (
                        <div className='collections-list'>
                            <div className='collections-list-title'>Collections:</div>
                            {
                                collectionList.map((collection, index) => (
                                    <div className='collection-item' key={collection._id}>
                                        <div className='collection-item-title'>{collection.name}</div>
                                        {
                                            collection.exists ? (
                                                <img src={check} className='colleciton-item-status' onClick={() => { 
                                                    let tempCollectionList = [...collectionList];
                                                    tempCollectionList[index].exists = false;
                                                    if(tempCollectionList[index].collectionId === collectionId) {
                                                        setCurrentCollectionExists(false); 
                                                    }

                                                    // Check to see if the collection exists all match up with the original list
                                                    // If they do then set updates made to false
                                                    let tempOriginalList = [...orjCollectionList];
                                                    let match = true;
                                                    for (let i = 0; i < tempCollectionList.length; i++) {
                                                        if(tempCollectionList[i].exists !== tempOriginalList[i]) {
                                                            match = false;
                                                            if(!updatesMade) setUpdatesMade(true);
                                                            break;
                                                        }
                                                    }

                                                    if(match) setUpdatesMade(false);
                                                    setCollectionList([...tempCollectionList]);
                                                }} />
                                            ) : (
                                                <img src={circle} className='colleciton-item-status' onClick={() => { 
                                                    let tempCollectionList = [...collectionList];
                                                    tempCollectionList[index].exists = true;
                                                    if(tempCollectionList[index].collectionId === collectionId) {
                                                        setCurrentCollectionExists(true); 
                                                    }
                                                    // Check to see if the collection exists all match up with the original list
                                                    // If they do then set updates made to false
                                                    let tempOriginalList = [...orjCollectionList];
                                                    let match = true;
                                                    for (let i = 0; i < tempCollectionList.length; i++) {
                                                        if(tempCollectionList[i].exists !== tempOriginalList[i]) {
                                                            match = false;
                                                            if(!updatesMade) setUpdatesMade(true);
                                                            break;
                                                        }
                                                    }

                                                    if(match) setUpdatesMade(false);
                                                    setCollectionList([...tempCollectionList]); 
                                                }} />
                                            )
                                        }
                                    </div>
                                ))
                            }
                            <button disabled={!updatesMade} className='collections-save-btn' style={{marginTop: '30px'}} onClick={submitCollectionUpdates}>Save Updates</button>
                        </div>
                    ) : (
                        <Loading type='beat' className='list-loading' size={20} />
                    )
            }
        </div>
    );
}

export default Details;