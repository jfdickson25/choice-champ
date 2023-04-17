import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import Footer from '../../shared/components/Navigation/Footer';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import remove from '../../shared/assets/img/remove.png';
import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';

import './Collection.css';

// TODO (Nice to have): Could be nice to add extra filtering of movies in a collection
// such as alphabetically and by date added

const Collection = props => {
    let history = useHistory();
    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our items list
     ***********************************************************/
    // Grab the collection type, name and id from the parameters
    let collectionType = useParams().type;
    let collectionName = useParams().name;
    let collectionId = useParams().id;

    const [items, setItems] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [shareCode, setShareCode] = useState(0);

    useEffect(() => {
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
        });
    }, []);

    /************************************************************
     * Logic for setting edit state and removing items
     ***********************************************************/
    const isEditHandler = () => isEdit ? setIsEdit(false) : setIsEdit(true);

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

    return (
        <React.Fragment>
            <div className='content'>
                { /* TODO: Look up difference between Link and NavLink */ }
                <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
                <h2 className='title'>{collectionName}</h2>
                <img src={ isEdit ? editing :  edit } className="edit" alt='Edit icon' onClick={isEditHandler} />
                <div className='share-code'>share code: {shareCode}</div>
                <input className='search-bar' placeholder='Search Collection' value={query} onChange={e => setQuery(e.target.value)}/>
                <img src={add} alt='Add icon' className='add' onClick={navAdd} />
                <div className={collectionType === 'game' ? 'collection-content-game' : 'collection-content'}>
                    { /* 
                        Received help from this article: https://bobbyhadz.com/blog/react-map-array-reverse 
                        We use the spread operator here because we want to make a copy of filteredItems. We don't want
                        to modify it
                    */ 
                    }
                    {
                        // Add a message if there are no items in the collection
                        filteredItems.length === 0 ? <p style={{textAlign: 'center', gridColumn: '1/3', fontWeight: 'bold'}}>No items in this collection</p> :
                        [...filteredItems].reverse().map(item => (
                            <div className='item-section' key={item.itemId} >
                                <div className='item-img' style={{backgroundImage: `url(${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}><p>{item.title}</p></div>
                                { isEdit ? (<img src={remove} alt={`${item.title} poster`} className='item-action' onClick={() => { removeItem(item._id) }} />) : null }
                            </div>
                        ))}
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
}

export default Collection;