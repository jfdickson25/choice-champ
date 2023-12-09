import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownAZ, faClock } from '@fortawesome/free-solid-svg-icons';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';

import './Collection.css';

const Collection = ({ socket }) => {
    const auth = useContext(AuthContext);
    let navigate = useNavigate();
    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our items list
     ***********************************************************/
    // Grab the collection type, name and id from the parameters
    let collectionType = useParams().type;
    let collectionId = useParams().id;
    let collectionNameParam = useParams().name;

    const [items, setItems] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [shareCode, setShareCode] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [collectionName, setCollectionName] = useState(useParams().name);
    const [showAlphabetical, setShowAlphabetical] = useState(false);
    const [navingBack, setNavingBack] = useState(false);
    const [navingAdd, setNavingAdd] = useState(false);

    const itemsRef = useRef(items);
    const { hash } = useLocation();

    useEffect(() => {
        auth.showFooterHandler(true);
        // Make a fetch get request to get all the items in a collection
        fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setItems(data.items);
            itemsRef.current = data.items;
            setShareCode(data.shareCode);

            // Give a little time for the items to load
            setTimeout(() => {
                setIsLoading(false);

                // If there is a hash in the url, scroll to that element
                if(hash) {
                    // Add a little more time for the items to load
                    setTimeout(() => {
                        // If there is a hash in the url, scroll to that element
                            const element = document.getElementById(hash.substring(1));
                            element.scrollIntoView({ behavior: "smooth" });
                    }, 500);
                }
            }, 500);

            // Join room with the collection id
            socket.emit('join-room', collectionId);
        });
    }, [auth, collectionId, socket]);

    useEffect(() => {
        socket.on('remove-item', (id) => {
            // Find item with the id and remove it from the list
            itemsRef.current = itemsRef.current.filter(item => item._id !== id);
            setItems(itemsRef.current);
        });

        socket.on('watched-item', (id) => {
            // Update the item with the given id to be watched
            itemsRef.current = itemsRef.current.map(item => {
                if(item._id === id && item.watched === false) {
                    item.watched = true;
                } else if(item._id === id && item.watched === true) {
                    item.watched = false;
                }

                return item;
            });

            setItems(itemsRef.current);
        });

        socket.on('add-item', (newItem) => {
            // Add the new item to the list
            itemsRef.current = [...itemsRef.current, newItem];
            setItems(itemsRef.current);
        });

        return () => {
            socket.off('remove-item');
            socket.off('watched-item');
            socket.off('add-item');
        }
    }, [socket]);

    /************************************************************
     * Logic for setting edit state and removing items
     ***********************************************************/
    const isEditHandler = () => {
        if(isEdit) {
            // Check to make sure the collection name is not empty
            if(collectionName !== '') {
                // If collection name has changed make a fetch post request to update the collection name
                if(collectionName !== collectionNameParam) {
                    fetch(`https://choice-champ-backend.glitch.me/collections/name/${collectionId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: collectionName
                        })
                    })
                    .then(res => {
                        setIsEdit(false);
                    });
                } else {
                    setIsEdit(false);
                }
            } else {
                alert('Collection name cannot be empty');
            }
        } else {
            setIsEdit(true);
        }
    }

    const removeItem = (id) => {
        // Make a fetch delete request to remove an item from a collection
        fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            itemsRef.current = itemsRef.current.filter(item => item._id !== id);
            setItems(itemsRef.current);
            // Emit to the server that an item has been removed
            socket.emit('remove-remote-item', id, collectionId);
        });
    }

    const navBack = () => {
        socket.emit('leave-room', collectionId);
        setNavingBack(true);
        setTimeout(() => {
            setNavingBack(false);
            navigate(`/collections/${collectionType}`);
        }, 1000);
    }

    const navAdd = () => {
        setNavingAdd(true);
        setTimeout(() => {
            setNavingAdd(false);
            navigate(`/collections/${collectionType}/${collectionName}/${collectionId}/add`);
        }, 1000);
    }

    const navDetails = (id) => {
        navigate(`/collections/${collectionType}/${collectionName}/${collectionId}/details/${id}`);
    }

    const updateWatched = (id, watched) => {
        // Make a fetch post request to update the watched status of an item
        fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                watched: !watched
            })
        })
        .then(res => {
            // Update the item with the given id to be watched
            setItems(items.map(item => {
                if(item._id === id && item.watched === false) {
                    item.watched = true;
                    item.timestamp = Math.floor(Date.now() / 1000);
                } else if(item._id === id && item.watched === true) {
                    item.watched = false;
                    // Remove the timestamp if the item is unwatched
                    item.timestamp = undefined;
                }

                return item;
            }));

            itemsRef.current = items;

            // Emit to the server that an item has been watched
            socket.emit('watched-remote-item', id, collectionId);
        });
    }

    /************************************************************
     * Logic for creating a query from the search bar. I received
     * help and direction from this youtube video Web dev simplified
     * https://youtu.be/E1cklb4aeXA
     ***********************************************************/
    const [query, setQuery] = useState('');

    // Q: Why do we use useMemo here?
    // A: useMemo is used to optimize the filtering of items. It will only filter the items
    // when the query changes. This is important because if we didn't use useMemo the items
    // would be filtered on every render. This would be a waste of resources.
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            return item.title.toLowerCase().includes(query.toLowerCase());
        })
    }, [items, query]);

    return (
        <React.Fragment>
            <div className='content'>
                { 
                    /* 
                        Q: What is the difference between a link and navlink?
                        A: A link is used to navigate to a different page. 
                           A navlink is used to navigate to a different page
                           but it also allows you to style the link based on
                           if it is active or not.
                    */ 
                }
                {
                    navingBack ? 
                    (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button-active.png?v=1702137193420" alt="Back symbol" className="top-left clickable" style={{animation: 'button-press .75s'}} />) : 
                    (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button.png?v=1702137134668" alt="Back symbol" className="top-left clickable" onClick={navBack} />)
                }
                { isEdit 
                    ? (<input className='title' style={{gridColumn:"5/14", marginBottom: "10px"}} value={collectionName} onChange={e => setCollectionName(e.target.value)} />)
                    : (<h2 className='title'>{collectionName}</h2>)
                }

                <img src={ isEdit ? editing :  edit } className="edit clickable" alt='Edit icon' onClick={isEditHandler} />
                <div className='share-code'>share code: {shareCode}</div>
                {
                    navingAdd ?
                    (<img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/plus-button-active.png?v=1702137827635' alt='Add icon' className='add clickable' style={{animation: 'button-press .75s'}} />) :
                    (<img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/plus-button.png?v=1702138169050' alt='Add icon' className='add clickable' onClick={navAdd} />)
                }
                <input className='search-bar' placeholder='Search Collection' value={query} onChange={e => setQuery(e.target.value)}/>
                <FontAwesomeIcon icon={faArrowDownAZ} size="xl" onClick={() => {setShowAlphabetical(true)}} className={showAlphabetical ? 'active-categorize clickable' : 'clickable'} />
                <FontAwesomeIcon icon={faClock} size="xl" onClick={() => {setShowAlphabetical(false)}} className={!showAlphabetical ? 'active-categorize clickable' : 'clickable'} />
                {
                    isLoading ? <Loading type='beat' className='list-loading' size={20} /> : 
                        (
                            <div className={collectionType === 'game' ? 'collection-content-game' : 'collection-content'}>
                                {
                                    (filteredItems.length === 0 && query === '') && <p className='no-items'>No items in this collection</p>
                                }
                                {
                                    (filteredItems.length === 0 && query !== '') && <p className='no-items'>No items match search</p>
                                }
                                {
                                    // Logic to check if we should show the items in alphabetical order or not
                                    showAlphabetical ? (
                                        [...filteredItems].sort((a, b) => a.title.localeCompare(b.title)).map(item => (
                                           // Only show if the item is not watched
                                           !item.watched ?
                                                (<div className='item-section' id={item.itemId} key={item.itemId} onClick={ !isEdit ? () => { navDetails(item.itemId) } : null } >
                                                    { 
                                                        !isEdit ? 
                                                            <img alt={`${item.title} poster`} className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img clickable' : collectionType === 'game' ? 'game-img clickable' : 'board-img clickable'} src={item.poster} />
                                                            :
                                                            <img alt={`${item.title} poster`} className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img' : collectionType === 'game' ? 'game-img' : 'board-img'} src={item.poster} />
                                                    } 
                                                    { (collectionType === 'game' || collectionType === 'board') && <p>{item.title}</p>}
                                                    { isEdit ? (<img src={'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433'} alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-game clickable' : 'item-action clickable'} onClick={() => { removeItem(item._id) }} />) : null }
                                                    { isEdit ? (<img src={item.watched ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/watched.png?v=1682136650141' : 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/unwatched.png?v=1682136649813'} alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-watched-game clickable' : 'item-action-watched clickable'} onClick={() => {updateWatched(item._id)}} />) : null }
                                                </div>
                                                )
                                            :   null
                                        )) 
                                    ) : (
                                        /* 
                                            Received help from this article: https://bobbyhadz.com/blog/react-map-array-reverse 
                                            We use the spread operator here because we want to make a copy of filteredItems. We don't want
                                            to modify it
                                        */ 
                                        [...filteredItems].reverse().map(item => (
                                            // Only show if the item is not watched
                                            !item.watched ?
                                                (<div className='item-section' id={item.itemId} key={item.itemId} onClick={ !isEdit ? () => { navDetails(item.itemId) } : null } >
                                                    { 
                                                        !isEdit ? 
                                                            <img alt={`${item.title} poster`} className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img clickable' : collectionType === 'game' ? 'game-img clickable' : 'board-img clickable'} src={item.poster} />
                                                            :
                                                            <img alt={`${item.title} poster`} className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img' : collectionType === 'game' ? 'game-img' : 'board-img'} src={item.poster} />
                                                    }
                                                    { (collectionType === 'game' || collectionType === 'board') && <p>{item.title}</p>}
                                                    { isEdit ? (<img src={'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433'} alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-game clickable' : 'item-action clickable'} onClick={() => { removeItem(item._id) }} />) : null }
                                                    { isEdit ? (<img src={item.watched ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/watched.png?v=1682136650141' : 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/unwatched.png?v=1682136649813'} alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-watched-game clickable' : 'item-action-watched clickable'} onClick={() => {updateWatched(item._id)}} />) : null }
                                                </div>
                                                )
                                            :   null
                                        ))
                                    )
                                }
                                { 
                                    // Add a divider if there are watched items
                                    filteredItems.filter(item => item.watched).length > 0 ? <div className={ collectionType === 'game' ? 'divider-game' : 'divider-other'}></div> : null 
                                }
                                {
                                    // Logic to check if we should show the items in alphabetical order or not
                                    showAlphabetical ? (
                                        [...filteredItems].sort((a, b) => a.title.localeCompare(b.title)).map(item => (
                                                // Only show if the item is watched
                                                item.watched ?
                                                (
                                                    <div className='item-section' id={item.itemId} key={item.itemId} onClick={ !isEdit ? () => { navDetails(item.itemId) } : null } >
                                                        <img alt={`${item.title} poster`} className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img' : collectionType === 'game' ? 'game-img' : 'board-img'} src={item.poster} />
                                                        { (collectionType === 'game' || collectionType === 'board') && <p>{item.title}</p>}
                                                        { isEdit ? (<img src={'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433'} alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-game clickable' : 'item-action clickable'} onClick={() => { removeItem(item._id) }} />) : null }
                                                        { isEdit ? (<img src={item.watched ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/watched.png?v=1682136650141' : 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/unwatched.png?v=1682136649813' } alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-watched-game clickable' : 'item-action-watched clickable'} onClick={() => {updateWatched(item._id, item.watched)}} />) : null }
                                                    </div>
                                                )
                                            : null
                                        ))
                                    ) : (
                                        [...filteredItems]
                                            .filter(item => item.watched)
                                            .sort((a, b) => a.timestamp - b.timestamp)
                                            .reverse().map(item => (
                                                <div className='item-section' id={item.itemId} key={item.itemId} onClick={ !isEdit ? () => { navDetails(item.itemId) } : null } >
                                                    <img alt={`${item.title} poster`} className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img' : collectionType === 'game' ? 'game-img' : 'board-img'} src={item.poster} />
                                                    { (collectionType === 'game' || collectionType === 'board') && <p>{item.title}</p>}
                                                    { isEdit ? (<img src={'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433'} alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-game clickable' : 'item-action clickable'} onClick={() => { removeItem(item._id) }} />) : null }
                                                    { isEdit ? (<img src={item.watched ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/watched.png?v=1682136650141' : 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/unwatched.png?v=1682136649813' } alt={`${item.title} poster`} className={ collectionType === 'game' ? 'item-action-watched-game clickable' : 'item-action-watched clickable'} onClick={() => {updateWatched(item._id, item.watched)}} />) : null }
                                                </div>
                                        ))
                                    )
                                }
                            </div>
                        )
                }
            </div>
        </React.Fragment>
    );
}

export default Collection;