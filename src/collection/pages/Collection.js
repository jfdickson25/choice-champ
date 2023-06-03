import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';
import { useSwipeable } from 'react-swipeable';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';

import './Collection.css';

// TODO (Nice to have): Could be nice to add extra filtering of movies in a collection
// such as alphabetically and by date added

const Collection = props => {
    const auth = useContext(AuthContext);
    let history = useHistory();
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
            setShareCode(data.shareCode);
            setIsLoading(false);
        });
    }, []);

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
            setItems(items.filter(item => item._id !== id));
        });
    }

    const navBack = () => {
        history.push(`/collections/${collectionType}`);
    }

    const navAdd = () => {
        history.push(`/collections/${collectionType}/${collectionName}/${collectionId}/add`);
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
                } else if(item._id === id && item.watched === true) {
                    item.watched = false;
                }

                return item;
            }));
        });
    }

    /************************************************************
     * Logic for creating a query from the search bar. I received
     * help and direction from this youtube video Web dev simplified
     * https://youtu.be/E1cklb4aeXA
     ***********************************************************/
    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            return item.title.toLowerCase().includes(query.toLowerCase());
        })
    }, [items, query]);

    const handlers = useSwipeable({
        onSwipedLeft: () => history.push('/party'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
        delta: 100
    });

    return (
        <React.Fragment>
            <div className='content' {...handlers}>
                { /* TODO: Look up difference between Link and NavLink */ }
                <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
                { isEdit 
                    ? (<input className='title' style={{gridColumn:"5/14", marginBottom: "10px"}} value={collectionName} onChange={e => setCollectionName(e.target.value)} />)
                    : (<h2 className='title'>{collectionName}</h2>)
                }

                <img src={ isEdit ? editing :  edit } className="edit" alt='Edit icon' onClick={isEditHandler} />
                <div className='share-code'>share code: {shareCode}</div>
                <input className='search-bar' placeholder='Search Collection' value={query} onChange={e => setQuery(e.target.value)}/>
                <img src={add} alt='Add icon' className='add' onClick={navAdd} />
                {
                    isLoading ? <Loading type='beat' className='list-loading' size={20} /> : 
                        (
                            <div className={collectionType === 'game' ? 'collection-content-game' : 'collection-content'}>
                                { /* 
                                    Received help from this article: https://bobbyhadz.com/blog/react-map-array-reverse 
                                    We use the spread operator here because we want to make a copy of filteredItems. We don't want
                                    to modify it
                                */ 
                                }
                                {
                                    // Add a message if there are no items in the collection
                                    filteredItems.length === 0 && <p style={{textAlign: 'center', gridColumn: '1/3', fontWeight: 'bold'}}>No items in this collection</p>
                                }
                                {
                                    [...filteredItems].reverse().map(item => (
                                        // Only show if the item is not watched
                                        !item.watched ?
                                            (<div className='item-section' key={item.itemId} >
                                                <div className='item-img' style={{backgroundImage: `url(${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}><p>{item.title}</p></div>
                                                { isEdit ? (<img src={'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433'} alt={`${item.title} poster`} className='item-action' onClick={() => { removeItem(item._id) }} />) : null }
                                                { isEdit ? (<img src={item.watched ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/watched.png?v=1682136650141' : 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/unwatched.png?v=1682136649813'} alt={`${item.title} poster`} className='item-action-watched' onClick={() => {updateWatched(item._id)}} />) : null }
                                            </div>
                                            )
                                        : null
                                    ))
                                }
                                { 
                                    // Add a divider if there are watched items
                                    filteredItems.filter(item => item.watched).length > 0 ? <div className={ collectionType === 'game' ? 'divider-game' : 'divider-other'}></div> : null 
                                }
                                {
                                    [...filteredItems].reverse().map(item => (
                                        // Only show if the item is watched
                                        item.watched ?
                                            (
                                                <div className='item-section' key={item.itemId} >
                                                    <div className='item-img' style={{backgroundImage: `url(${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}><p>{item.title}</p></div>
                                                    { isEdit ? (<img src={'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433'} alt={`${item.title} poster`} className='item-action' onClick={() => { removeItem(item._id) }} />) : null }
                                                    { isEdit ? (<img src={item.watched ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/watched.png?v=1682136650141' : 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/unwatched.png?v=1682136649813' } alt={`${item.title} poster`} className='item-action-watched' onClick={() => {updateWatched(item._id, item.watched)}} />) : null }
                                                </div>
                                            )
                                        : null
                                    ))
                                }
                            </div>
                        )
                }
            </div>
        </React.Fragment>
    );
}

export default Collection;