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
    const [collectionList, setCollectionList] = useState([]);
    const [loadingCollectionList, setLoadingCollectionList] = useState(false);
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

    const addToCollection = (addCollectionId, index) => {

        let tempId = itemId;

        // For collections that are not games or boards, we need to parse the id to an int
        // this is because we grab the id from the url and it is a string
        if(collectionType !== 'board') {
            tempId = parseInt(tempId);
        }

        // Make a fetch post request to add an item to a collection
        fetch(`https://choice-champ-backend.glitch.me/collections/items/${addCollectionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                title: details.title,
                id: tempId,
                poster: details.poster
            }])
        })
        .then(res => res.json())
        .then(data => {
            // Create a temp collection list to update the collection list
            // Update the collection list with the new item id
            let tempCollection = [...collectionList];
            tempCollection[index].itemId = data.newItems[0]._id;
            setCollectionList([...tempCollection]);
        });
    }

    const removeFromCollection = (removeCollectionId, removeItemId) => {
        // Make a fetch delete request to remove an item from a collection
        fetch(`https://choice-champ-backend.glitch.me/collections/items/${removeCollectionId}/${removeItemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return (
        <div className='content'>
            {
                navingBack ? 
                (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button-active.png?v=1702137193420" alt="Back symbol" className="top-left clickable" style={{animation: 'button-press .75s'}} />) : 
                (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button.png?v=1702137134668" alt="Back symbol" className="top-left clickable" onClick={navBack} />)
            }
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
                                    <div className='details-provider-title'>Stream:</div>
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

                                                    removeFromCollection(tempCollectionList[index].collectionId, tempCollectionList[index].itemId);

                                                    setCollectionList([...tempCollectionList]);
                                                }} />
                                            ) : (
                                                <img src={circle} className='colleciton-item-status' onClick={() => { 
                                                    let tempCollectionList = [...collectionList];
                                                    tempCollectionList[index].exists = true;
                                                    if(tempCollectionList[index].collectionId === collectionId) {
                                                        setCurrentCollectionExists(true); 
                                                    }

                                                    addToCollection(tempCollectionList[index].collectionId, index);

                                                    setCollectionList([...tempCollectionList]); 
                                                }} />
                                            )
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <Loading type='beat' className='list-loading' size={20} />
                    )
            }
        </div>
    );
}

export default Details;