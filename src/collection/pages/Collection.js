import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

    useEffect(() => {
        // TODO: This will be replaced by searching the collection from the backend

        setItems([
            {
                id: 268,
                title: 'Batman',
                poster: '/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg'
            },
            {
               id:  2661,
               title: 'Batman',
               poster: '/zzoPxWHnPa0eyfkMLgwbNvdEcVF.jpg'
            },
            {
                id: 125249,
                title: 'Batman',
                poster: '/6XYL5JRHxaLLd0ZwsBugaAuGHTa.jpg'
            },
            {
                id: 1003579,
                title: 'Batman: The Doom That Came to Gotham',
                poster: '/hrATQE8ScQceohwInaMluluNEaf.jpg'
            },
            {
                id: 414906,
                title: 'The Batman',
                poster: '/74xTEgt7R36Fpooo50r9T25onhq.jpg'
            },
            {
                id: 886396,
                title: 'Batman and Superman: Battle of the Super Sons',
                poster: '/mvffaexT5kA3chOnGxwBSlRoshh.jpg'
            },
            {
                id: 209112,
                title: 'Batman v Superman: Dawn of Justice',
                poster: '/5UsK3grJvtQrtzEgqNlDljJW96w.jpg'
            },
            {
                id: 485942,
                title: 'Batman Ninja',
                poster: '/5xSB0Npkc9Fd9kahKBsq9P4Cdzp.jpg'
            },
            {
                id: 272,
                title: 'Batman Begins',
                poster: '/8RW2runSEc34IwKN2D1aPcJd2UL.jpg'
            }
        ])
    }, []);

    /************************************************************
     * Logic for setting edit state and removing items
     ***********************************************************/
    const isEditHandler = () => isEdit ? setIsEdit(false) : setIsEdit(true);

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));

        // TODO: Add backend call to remove from collection
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
                <Link to={`/collections/${collectionType}`} className="back">
                    <img src={back} alt="Back symbol" />
                </Link>
                <h2 className='title'>{collectionName}</h2>
                <img src={ isEdit ? editing :  edit } className="edit" alt='Edit icon' onClick={isEditHandler} />
                <input className='search-bar' placeholder='Search Collection' value={query} onChange={e => setQuery(e.target.value)}/>
                <Link to={`/collections/${collectionType}/${collectionName}/${collectionId}/add`} className='add'>
                    <img src={add} alt='Add icon' />
                </Link>
                <div className='collection-content'>
                    { /* 
                        Received help from this article: https://bobbyhadz.com/blog/react-map-array-reverse 
                        We use the spread operator here because we want to make a copy of filteredItems. We don't want
                        to modify it
                    */ 
                    }
                    {[...filteredItems].reverse().map(item => (
                        <div className='item-section' key={item.id} >
                            <div className='item-img' style={{backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}><p>{item.title}</p></div>
                            { isEdit ? (<img src={remove} alt={`${item.title} poster`} className='item-action' onClick={() => { removeItem(item.id) }} />) : null }
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </React.Fragment>
    );
}

export default Collection;