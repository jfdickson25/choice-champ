import React, { useRef, useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';
import _ from 'lodash';

import { Dialog } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import './Search.css';

import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';
import searchIcon from '../../shared/assets/img/search.svg';

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
    const [noMatch, setNoMatch] = useState(false);
    const [open, setOpen] = useState(false);
    const [loadingBoardGame, setLoadingBoardGame] = useState(false);
    const searchRef = useRef('');

    const [activeBoardGame, setActiveBoardGame] = useState({});

    // Create a ref of collection
    const collectionRef = useRef(collection);

    const notify = () => toast.success(`Item saved to ${collectionName} collection`, {
        position: "bottom-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });

    const notifyRemove = () => toast(`Item removed from ${collectionName} collection`, {
        position: "bottom-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });

    useEffect(() => {
        auth.showFooterHandler(true);
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
            setNoMatch(false);
            setIsLoading(false);
            return;
        }

        // Make a fetch request to get all movies that match the search
        fetch(`https://choice-champ-backend.glitch.me/media/${collectionType}/${search}/1`)
        .then(res => res.json())
        .then(res => {
            if(res.media.results.length === 0) {
                setItems([]);
                setIsLoading(false);
                setNoMatch(true);
                return;
            }

            // Reset the items to populate with updated value
            setItems([]);

            res.media.results.forEach(mediaItem => {

                // Make sure the item is not already in the collection
                let inCollection = false;

                // Check if item exists in collection ref
                collectionRef.current.forEach(item => {
                    if(collectionType !== 'game' && item.itemId === mediaItem.id) {
                        inCollection = true;
                    } else if (collectionType === 'game' && item.itemId === mediaItem.guid) {
                        inCollection = true;
                    }
                });

                if (collectionType === 'movie') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.title,
                        poster: `https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`,
                        selected: false,
                        inCollection: inCollection,
                        loadingUpdate: false
                    }]);

                    setIsLoading(false);
                } else if (collectionType === 'tv') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        poster: `https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`,
                        selected: false,
                        inCollection: inCollection,
                        loadingUpdate: false
                    }]);

                    setIsLoading(false);
                } else if (collectionType === 'game') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.guid,
                        title: mediaItem.name,
                        poster: mediaItem.image.original_url,
                        selected: false,
                        inCollection: inCollection,
                        loadingUpdate: false
                    }]);

                    setIsLoading(false);
                } else if (collectionType === 'board') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        selected: false,
                        inCollection: inCollection,
                        loadingUpdate: false
                    }]);

                    setIsLoading(false);
                }
            });
        })
        .catch(err => {
            console.log(err);
            setIsLoading(false);
        });
    };

    // useRef is used to create a mutable ref object whose .current property is initialized 
    // to the passed argument (initialValue). The returned object will persist for the full lifetime of the component.
    // Debounce is a function to limit the number of times a function can be called in a given time period
    let debounced = useRef(_.debounce(updateList, 2000, {'search' : ''})).current;

    // Functions for handling change to input
    const changeHandler = (event) => {
        setIsLoading(true);
        setNoMatch(false);
        // Debounce example from web dev simplified (TODO: Watch rest on throttle)
        // https://www.youtube.com/watch?v=cjIswDCKgu0
        debounced(event.target.value);
    }

    const removeItem = (itemId, board) => {
        // Find the collection item with the itemId and remove it from the collection
        const collectionItem = collectionRef.current.find(item => item.itemId === itemId);

        if(!board) {
            // Find the item with the id and set loadingUpdate to true
            const loadingSetItems = items.map(item => {
                if(item.id === itemId) {
                    item.loadingUpdate = true;
                }
                return item;
            });
            setItems(loadingSetItems);
        } else {
            setActiveBoardGame({
                ...activeBoardGame,
                loadingUpdate: true
            });
        }

        fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}/${collectionItem.mongoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if(!board) {
                // Find the item with the id and set inCollection to false
                const updatedItems = items.map(item => {
                    if(item.id === itemId) {
                        item.inCollection = false;
                        item.loadingUpdate = false;
                    }
                    return item;
                });

                setItems(updatedItems);
            } else {
                setActiveBoardGame({
                    ...activeBoardGame,
                    collectionStatus: false,
                    loadingUpdate: false
                });

                 // Find the item with the id and set inCollection to false
                 const updatedItems = items.map(item => {
                    if(item.id === itemId) {
                        item.inCollection = false;
                    }
                    return item;
                });

                setItems(updatedItems);
            }

            // Remove the item from the collection
            const updatedCollection = collectionRef.current.filter(item => item.itemId !== itemId);
            collectionRef.current = updatedCollection;
            setCollection(collectionRef.current);

            notifyRemove();

            // Emit to the server that an item has been removed
            socket.emit('remove-remote-item', collectionItem.mongoId, collectionId);
        });
    }

    const addItem = (itemId, itemTitle, itemPoster, board) => {

        if(!board) {
            // Find the item with the id and set loadingUpdate to true
            const loadingSetItems = items.map(item => {
                if(item.id === itemId) {
                    item.loadingUpdate = true;
                }
                return item;
            });
            setItems(loadingSetItems);
        } else {
            setActiveBoardGame({
                ...activeBoardGame,
                loadingUpdate: true
            });
        }

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

            if(!board) {
                // Update the items inCollection value
                const updatedItems = items.map(item => {
                    if(item.id === itemId) {
                        item.inCollection = true;
                        item.loadingUpdate = false;
                    }
                    return item;
                });
                setItems(updatedItems);
            } else {
                setActiveBoardGame({
                    ...activeBoardGame,
                    collectionStatus: true,
                    loadingUpdate: false
                });

                // Update the items inCollection value
                const updatedItems = items.map(item => {
                    if(item.id === itemId) {
                        item.inCollection = true;
                    }
                    return item;
                });
                setItems(updatedItems);
            }

            notify();
        });
    }

    const getActiveBoardGame = (itemId, status) => {
        setLoadingBoardGame(true);
        setOpen(true);
        
        // Get all the items in the collection to check if any items in the search are already in the collection
        fetch(`https://choice-champ-backend.glitch.me/media/getInfo/${collectionType}/${itemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setActiveBoardGame({
                id: itemId,
                title: data.media.details.title,
                poster: data.media.details.poster,
                maxPlayers: data.media.details.maxPlayers,
                minPlayers: data.media.details.minPlayers,
                playingTime: data.media.details.runtime,
                collectionStatus: status,
                loadingUpdate: false
            });

            setLoadingBoardGame(false);
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
            <ToastContainer />
            {
                navingBack ? 
                (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button-active.png?v=1702137193420" alt="Back symbol" className="top-left clickable" style={{animation: 'button-press .75s'}} />) : 
                (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button.png?v=1702137134668" alt="Back symbol" className="top-left clickable" onClick={navBack} />)
            }
            <h2 className={`title color-${collectionType}`}>{collectionName}</h2>
            <div className='search-bar-container'>
                <img src={searchIcon} alt='Search icon' className='search-icon' />
                <input className='search-bar' id='search' placeholder='Search' onChange={changeHandler} ref={searchRef} />
                {
                    searchRef.current.value !== '' &&
                    <FontAwesomeIcon icon={faXmark} size="lg" className='clear-search clickable' onClick={() => { searchRef.current.value = ''; updateList(''); }} />
                }
            </div>
            { noMatch && <p className='no-match'>No matches found</p>}
            {
                isLoading ? <Loading type='sync' className='list-loading' size={15} speed={.5} /> :
                (<div className='collection-content'>
                    {items.map(item => (
                        <div className='item-section' key={item.id} onClick={() => {
                            if(!item.loadingUpdate && collectionType !== 'board') {
                                if(!item.inCollection) {
                                        addItem(item.id, item.title, item.poster, false);
                                } else {
                                    removeItem(item.id, false);
                                }
                            } else if (collectionType === 'board') {
                                getActiveBoardGame(item.id, item.inCollection);
                                setOpen(true);
                            }
                        }}>

                            { 
                                collectionType !== 'board' ?
                                <img src={item.poster} alt={`${item.title} poster`} className='item-img' /> 
                                :
                                <div className='board-img-search' /> 
                            }
                            { collectionType === 'board' && ( <p className='item-title'>{item.title}</p> ) }                      
                            {
                                collectionType !== "board" && (
                                    <React.Fragment>
                                    {
                                        item.loadingUpdate ? 
                                        (
                                            <Loading type='beat' size={15} speed={.5} className='loading-save' />
                                        ) :
                                        (
                                            item.inCollection ? 
                                            (<img src={check} alt={`${item.title} saved`} className='item-action clickable' />) :
                                            (<img id={item.id} src={circle} alt={`${item.title} unselected`} className='item-action clickable' />)
                                        )
                                    }
                                    </React.Fragment>
                                )
                            }
                        </div>
                    ))}
                </div>)
            }
            <Dialog open={open} onClose={() => { setOpen(false) }} fullWidth maxWidth='lg'>
                <div className='dialog-content'>
                    {
                        loadingBoardGame ?
                        (<Loading type='beat' className='board-details-loading' size={20} />) :
                        (
                            <React.Fragment>
                            <div id='status-icon'>
                                {
                                    activeBoardGame.loadingUpdate ? 
                                    (
                                        <Loading type='beat' size={15} speed={.5} className='loading-save-modal' />
                                    ) :
                                    (
                                        activeBoardGame.collectionStatus ? 
                                            (<img src={check} alt={`${activeBoardGame.title} saved`} className='item-action-board clickable' onClick={ () => { removeItem(activeBoardGame.id, true ) }} />) :
                                            (<img id={activeBoardGame.id} src={circle} alt={`${activeBoardGame.title} unselected`} className='item-action-board clickable' onClick={ () => { addItem(activeBoardGame.id, activeBoardGame.title, activeBoardGame.poster, true)} } />)
                                    )
                                }
                            </div>
                            <img src={activeBoardGame.poster} alt={`${activeBoardGame.title} poster`} className='modal-poster' />
                                <div className='modal-header'>
                                    { activeBoardGame.title }
                                </div>
                                <div className='modal-details'>
                                    <p>Min Players: {activeBoardGame.minPlayers}</p>
                                    <p>Max Players: {activeBoardGame.maxPlayers}</p>
                                    <p>Play Time: {activeBoardGame.playingTime} min</p>
                                </div>
                            </React.Fragment>
                        )
                    }
                </div>
            </Dialog>
        </div>
    );
}

export default Search;