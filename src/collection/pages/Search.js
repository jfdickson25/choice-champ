import React, { useRef, useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import './Search.css';

import back from '../../shared/assets/img/back.svg';
import save from '../../shared/assets/img/save.png';
import circle from '../../shared/assets/img/circle.png';
import filledCircle from '../../shared/assets/img/filled-circle.png';
import check from '../../shared/assets/img/check.png';

const Category = props => {
    let history = useHistory();
    
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

    // Input ref grabs value from input when search is entered
    const inputRef = useRef();

    useEffect(() => {
        // Get all the items in the collection to check if any items in the search are already in the collection
        fetch(`http://localhost:5000/collections/items/${collectionId}`, {
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
            }
        });
    }, []);

    // Debounce is used to prevent the search from being called on every key press
    function debounce(cb, delay = 500) {
        let timeout;

        return(...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                cb(...args);
            }, delay);
        }
    }

    const updateDebounce = debounce(async (search) => {
        // Check if the collection type is movies
        // TODO: Add tv shows and games
        if(collectionType === 'movies') {

            if (search === '') {
                setItems([]);
                return;
            }

            // Make a fetch request to get all movies that match the search
            fetch(`http://localhost:5000/movies/${search}/1`)
            .then(res => res.json())
            .then(res => {
                // Reset the items to populate with updated value
                setItems([]);

                res.movies.results.forEach(movie => {

                    // Make sure the movie isn't already in the collection
                    let inCollection = false;
                    collection.forEach(item => {
                        if(item.itemId === movie.id) {
                            inCollection = true;
                        }
                    });

                    setItems(prevState => [...prevState, {
                        id: movie.id,
                        title: movie.title,
                        poster: movie.poster_path,
                        selected: false,
                        inCollection: inCollection
                    }]);
                });
            });
        }
    });

    // Functions for handling change to input
    const changeHandler = (event) => {
        // Debounce example from web dev simplified (TODO: Watch rest on throttle)
        // https://www.youtube.com/watch?v=cjIswDCKgu0
        updateDebounce(event.target.value);
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
            fetch(`http://localhost:5000/collections/items/${collectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedItems)
            });

            // Update to set selected to false and set inCollection to true in selectedItems then setItems to selectedItems
            const updatedItems = items.map(item => {
                if(item.selected === true) {
                    item.selected = false;
                    item.inCollection = true;
                }
                return item;
            });

            setItems(updatedItems);
        }
    }

    const navBack = () => {
        history.push(`/collections/${collectionType}/${collectionName}/${collectionId}`);
    }

    return (
        <div className='content'>
            <img src={back} alt="Back symbol" className="top-right" onClick={navBack} />
            <h2 className='title'>{collectionName}</h2>
            <img src={save} className="edit" alt='Save icon' onClick={addItems} />
            <input className='search-bar' placeholder='Search' onChange={changeHandler} ref={inputRef} />
            <div className='collection-content'>
                {items.map(item => (
                    <div className='item-section' key={item.id}>
                        <div className='item-img' style={{backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}><p>{item.title}</p></div>
                        {
                            item.inCollection ? (<img src={filledCircle} alt={`${item.title} poster`} className='item-action' />) :
                            (
                                item.selected 
                                ? (<img id={item.id} src={check} alt={`${item.title} poster`} className='item-action' onClick={() => { checkUncheckItem(item.id) }} />)
                                : (<img id={item.id} src={circle} alt={`${item.title} poster`} className='item-action' onClick={() => { checkUncheckItem(item.id) }} />)
                            )
                        }
                        </div>
                ))}
            </div>
        </div>
    );
}

export default Category;