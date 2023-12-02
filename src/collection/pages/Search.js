import React, { useRef, useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';
import _ from 'lodash';

import './Search.css';

import back from '../../shared/assets/img/back.svg';
import circle from '../../shared/assets/img/circle.png';
import filledCircle from '../../shared/assets/img/filled-circle.png';
import check from '../../shared/assets/img/check.png';
import { set } from 'react-hook-form';

const Search = ({ socket }) => {
    const auth = useContext(AuthContext);
    let navigate = useNavigate();

    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our movies list
     ***********************************************************/
    // Grab the collection name and id from the parameters
    let collectionType = useParams().type;
    let collectionName = useParams().name;
    let collectionId = useParams().id;

    const [items, setItems] = useState([]);
    const [collection, setCollection] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [navingBack, setNavingBack] = useState(false);

    // Create a ref of collection
    const collectionRef = useRef(collection);

    useEffect(() => {
        auth.showFooterHandler(false);
        // Get all the items in the collection to check if any items in the search are already in the collection
        fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            // Verify that data.items is not undefined
            if(data.items) {
                // Set collection to the items in the collection but only the id
                collectionRef.current = data.items.map(item => {
                    return {
                        itemId: item.itemId,
                        mongoId: item._id
                    }
                });

                setCollection(collectionRef.current);
            }
        });
    }, [auth, collectionType, collectionId]);

    const updateList = (search) => {
        if (search === '' || search === undefined || search === null) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        // Make a fetch request to get all movies that match the search
        fetch(`https://choice-champ-backend.glitch.me/media/${collectionType}/${search}/1`)
        .then(res => res.json())
        .then(res => {
            // Reset the items to populate with updated value
            setItems([]);

                res.media.results.forEach(mediaItem => {

                // Make sure the item is not already in the collection
                let inCollection = false;

                // Check if item exists in collection ref
                collectionRef.current.forEach(item => {
                    if(item.itemId === mediaItem.id) {
                        inCollection = true;
                    }
                });

                if (collectionType === 'movie') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.title,
                        poster: `https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`,
                        selected: false,
                        inCollection: inCollection
                    }]);

                    setIsLoading(false);
                } else if (collectionType === 'tv') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        poster: `https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`,
                        selected: false,
                        inCollection: inCollection
                    }]);

                    setIsLoading(false);
                } else if (collectionType === 'game') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        poster: mediaItem.background_image,
                        selected: false,
                        inCollection: inCollection
                    }]);

                    setIsLoading(false);
                } else if (collectionType === 'board') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        selected: false,
                        inCollection: inCollection
                    }]);

                    setIsLoading(false);
                }
            });
        });
    };

    // useRef is used to create a mutable ref object whose .current property is initialized 
    // to the passed argument (initialValue). The returned object will persist for the full lifetime of the component.
    // Debounce is a function to limit the number of times a function can be called in a given time period
    let debounced = useRef(_.debounce(updateList, 2000, {'search' : ''})).current;

    // Functions for handling change to input
    const changeHandler = (event) => {
        setIsLoading(true);
        // Debounce example from web dev simplified (TODO: Watch rest on throttle)
        // https://www.youtube.com/watch?v=cjIswDCKgu0
        debounced(event.target.value);
    }

    const removeItem = (itemId) => {
        // Find the collection item with the itemId and remove it from the collection
        const collectionItem = collectionRef.current.find(item => item.itemId === itemId);

        fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}/${collectionItem.mongoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Find the item with the id and set inCollection to false
        const updatedItems = items.map(item => {
            if(item.id === itemId) {
                item.inCollection = false;
            }
            return item;
        });

        setItems(updatedItems);

        // Remove the item from the collection
        const updatedCollection = collectionRef.current.filter(item => item.itemId !== itemId);
        collectionRef.current = updatedCollection;
        setCollection(collectionRef.current);

        // Emit to the server that an item has been removed
        socket.emit('remove-remote-item', collectionItem.mongoId, collectionId);
    }

    const addItem = (itemId, itemTitle, itemPoster) => {
        // Make a fetch post request to add an item to a collection
        fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                title: itemTitle,
                id: itemId,
                poster: itemPoster
            }])
        })
        .then(res => res.json())
        .then(data => {
            collectionRef.current.push({itemId: itemId, mongoId: data.newItems[0]._id});
            setCollection(collectionRef.current);

            socket.emit('add-remote-item', {title: itemTitle, itemId: itemId, poster: itemPoster, _id: data.newItems[0]._id, watched: false}, collectionId);

            // Update the items inCollection value
            const updatedItems = items.map(item => {
                if(item.id === itemId) {
                    item.inCollection = true;
                }
                return item;
            });
            setItems(updatedItems);
        });
    }

    const navBack = () => {
        setNavingBack(true);
        setTimeout(() => {
            setNavingBack(false);
            navigate(`/collections/${collectionType}/${collectionName}/${collectionId}`);
        }, 1000);
    }

    return (
        <div className='content'>
            <img src={back} alt="Back symbol" className="top-left clickable" onClick={navBack} 
                style={navingBack ? {animation: 'button-press .75s'} : null}
            />
            <h2 className='title'>{collectionName}</h2>
            <input className='search-bar' placeholder='Search' onChange={changeHandler} />
            {
                isLoading ? <Loading type='sync' className='list-loading' size={15} speed={.5} /> :
                (<div className={collectionType === 'game' ? 'collection-content-game' : 'collection-content'}>
                    {items.map(item => (
                        <div className='item-section' key={item.id} onClick={() => {
                            if(!item.inCollection) {
                                if(collectionType === 'board') {
                                    addItem(item.id, item.title);
                                } else {
                                    addItem(item.id, item.title, item.poster);
                                }
                            } else {
                                removeItem(item.id);
                            }
                        }}>

                                { 
                                    collectionType !== 'board' ?
                                    <img src={item.poster} alt={`${item.title} poster`} className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img' : 'game-img'} /> 
                                    :
                                    <div className='board-img-search' /> 
                                }
                                { (collectionType !== 'movie' && collectionType !== 'tv') && ( <p className={ collectionType === 'board' ? 'item-title' : undefined }>{item.title}</p> ) }                      
                            {
                                item.inCollection ? 
                                (<img src={check} alt={`${item.title} saved`} style={collectionType === 'game' ? {width: '15%'} : null} className={collectionType === 'game' ? 'item-action-game clickable' : 'item-action clickable'} />) :
                                (<img id={item.id} src={circle} alt={`${item.title} unselected`} className={collectionType === 'game' ? 'item-action-game clickable' : 'item-action clickable'} />)
                            }
                            </div>
                    ))}
                </div>)
            }
        </div>
    );
}

export default Search;