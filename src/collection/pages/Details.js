import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';

import './Details.css';

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

    useEffect(() => {
        auth.showFooterHandler(false);
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
        });
    }, []);

    const navBack = () => {
        navigate(`/collections/${collectionType}/${collectionName}/${collectionId}`);
    }

    return (
        <div className='content'>
            <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
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
        </div>
    );
}

export default Details;