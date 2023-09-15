import React, { useRef, useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import Loading from '../../shared/components/Loading';
import _ from 'lodash';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Search.css';

import back from '../../shared/assets/img/back.svg';
import circle from '../../shared/assets/img/circle.png';
import filledCircle from '../../shared/assets/img/filled-circle.png';
import check from '../../shared/assets/img/check.png';

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

    // Create a ref of collection
    const collectionRef = useRef(collection);

    const notify = () => toast.success(`Items saved to ${collectionName} collection`, {
        position: "bottom-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
    });

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
                setCollection(data.items);
                collectionRef.current = data.items;
            }
        });
    }, []);

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
                    if(item.itemId == mediaItem.id) {
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
                } else if (collectionType === 'tv') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        poster: `https://image.tmdb.org/t/p/w500${mediaItem.poster_path}`,
                        selected: false,
                        inCollection: inCollection
                    }]);
                } else if (collectionType === 'game') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        poster: mediaItem.background_image,
                        selected: false,
                        inCollection: inCollection
                    }]);
                } else if (collectionType === 'board') {
                    setItems(prevState => [...prevState, {
                        id: mediaItem.id,
                        title: mediaItem.name,
                        selected: false,
                        inCollection: inCollection
                    }]);
                }
            });

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
        // Debounce example from web dev simplified (TODO: Watch rest on throttle)
        // https://www.youtube.com/watch?v=cjIswDCKgu0
        debounced(event.target.value);
    }

    const checkUncheckItem = (itemId) => {
        // Find the item in the array and toggle the selected value
        const updatedItems = items.map(item => {
            if(item.id === itemId) {
                item.selected = !item.selected;
            }
            return item;
        });

        setItems(updatedItems);
    }

    const addItems = () => {
        // Filter the items to only get the selected ones
        const selectedItems = items.filter(item => item.selected === true);

        // Check to make sure selectedItems is not empty
        if(selectedItems.length !== 0) {
            // Send the selected items to the backend to be added to the collection
            fetch(`https://choice-champ-backend.glitch.me/collections/items/${collectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedItems)
            })
            .then(res => res.json())
            .then(data => {
                // Update to set selected to false and set inCollection to true in selectedItems then setItems to selectedItems
                const updatedItems = items.map(item => {
                    if(item.selected === true) {
                        item.selected = false;
                        item.inCollection = true;
                    }
                    return item;
                });
            
                selectedItems.forEach(item => {
                    collectionRef.current.push({
                        title: item.title,
                        poster: item.poster,
                        watched: false,
                        itemId: item.id
                    })
                });

                socket.emit('add-remote-items', data.newItems, collectionId);

                setItems(updatedItems);
                notify();
            });
        }
    }

    const navBack = () => {
        navigate(`/collections/${collectionType}/${collectionName}/${collectionId}`);
    }

    return (
        <div className='content'>
            <ToastContainer
                position="bottom-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                style={{ textAlign: "center" }}
            />
            <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
            <h2 className='title'>{collectionName}</h2>
            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/save.png?v=1682564025941' id='save-icon' className="save-icon" alt='Save icon' onClick={addItems} />
            <input className='search-bar' placeholder='Search' onChange={changeHandler} />
            {
                isLoading ? <Loading type='sync' className='list-loading' size={15} speed={.5} /> :
                (<div className={collectionType === 'game' ? 'collection-content-game' : 'collection-content'}>
                    {items.map(item => (
                        <div className='item-section' key={item.id}>

                                <div className={collectionType === 'movie' || collectionType === 'tv' ? 'item-img' : collectionType === 'game' ? 'game-img' : 'board-img'} style={ collectionType !== 'board' ? {backgroundImage: `url(${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'contain'} : null }>
                                    { (collectionType !== 'movie' && collectionType !== 'tv') && <p className={ collectionType === 'board' && 'item-title'}>{item.title}</p> }
                                </div>                       {
                                item.inCollection ? (<img src={filledCircle} alt={`${item.title} poster`} style={collectionType === 'game' ? {width: '15%'} : null} className={collectionType === 'game' ? 'item-action-game' : 'item-action'}  />) :
                                (
                                    item.selected 
                                    ? (<img id={item.id} src={check} alt={`${item.title} poster`} className={collectionType === 'game' ? 'item-action-game' : 'item-action'} onClick={() => { checkUncheckItem(item.id) }} />)
                                    : (<img id={item.id} src={circle} alt={`${item.title} poster`} className={collectionType === 'game' ? 'item-action-game' : 'item-action'} onClick={() => { checkUncheckItem(item.id) }} />)
                                )
                            }
                            </div>
                    ))}
                </div>)
            }
        </div>
    );
}

export default Search;