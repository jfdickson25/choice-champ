import React, { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import './Search.css';

import back from '../../shared/assets/img/back.svg';
import circle from '../../shared/assets/img/circle.png';
import check from '../../shared/assets/img/check.png';

// TODO: Add some kind of functionality to save to library (saving as you click doesn't fell weighted)

const Category = props => {
    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our movies list
     ***********************************************************/
    // Grab the collection name and id from the parameters
    let collectionType = useParams().type;
    let collectionName = useParams().name;
    let collectionId = useParams().id;

    const [items, setItems] = useState([]);

    // Input ref grabs value from input when search is entered
    const inputRef = useRef();

    function debounce(cb, delay = 500) {
        let timeout;

        return(...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                cb(...args);
            }, delay);
        }
    }

    const updateDebounce = debounce((search) => {
        if(collectionType === 'movies') {
            // TODO: Update to be a backend call
            fetch(`https://api.themoviedb.org/3/search/movie?api_key=c12d4979283eb8eb2b9dd58aa91c99e2&query=${search}`)
            .then(response => response.json())
            .then(res => {
                // Reset the items to populate with updated value
                setItems([]);
                
                res.results.forEach(movie => {
                    setItems(prevState => [...prevState, {
                        id: movie.id,
                        title: movie.title,
                        poster: movie.poster_path,
                        selected: false
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

    return (
        <div className='content'>
            <Link to={`/collections/${collectionType}/${collectionName}/${collectionId}`} className="back">
                <img src={back} alt="Back symbol" />
            </Link>
            <h2 className='title'>{collectionName}</h2>
            <input className='search-bar' placeholder='Search' onChange={changeHandler} ref={inputRef} />
            <div className='collection-content'>
                {items.map(item => (
                    <div className='item-section' key={item.id}>
                        <div className='item-img' style={{backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}><p>{item.title}</p></div>
                        {
                            item.selected 
                            ? (<img id={item.id} src={check} alt={`${item.title} poster`} className='item-action unselected' onClick={() => { checkUncheckItem(item.id) }} />)
                            : (<img id={item.id} src={circle} alt={`${item.title} poster`} className='item-action selected' onClick={() => { checkUncheckItem(item.id) }} />)
                        }
                        </div>
                ))}
            </div>
        </div>
    );
}

export default Category;