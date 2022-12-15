import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import Footer from '../../shared/components/Navigation/Footer';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import remove from '../../shared/assets/img/remove.png';
import edit from '../../shared/assets/img/edit.png';

import './Collections.css';
import { Link } from 'react-router-dom';
import ModalComp from '../../shared/components/ModalComp';

const Collections = props => {
    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our collections list
     ***********************************************************/
    // Grab the type from the parameters
    let collectionsType = useParams().type;

    // Variable for title depending on the category
    const [title, setTitle] = useState('');
    // State for collections
    const [collections, setCollections] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    // Empty array will only run on the initial render
    useEffect(() => {
        // Switch content based on the type received in the url params
        switch(collectionsType) {
            case('movies'):
                setTitle('Movie Collections');
                // TODO: Replace with call to backend
                setCollections([
                    { id: "1", name: 'Watchlist' },
                    { id: "2", name: 'Netflix' },
                    { id: "3", name: 'HBO Max' },
                    { id: "4", name: 'Disney Plus' }
                ]);
                break;
            case('tv'):
                setTitle('TV Collections');
                break;
            case('games'):
                setTitle('Game Collections');
                break;
            default:
                setTitle('Invalid Collections Type');
        }
    }, [collectionsType]);

    /************************************************************
     * Logic for setting edit state and removing movies
     ***********************************************************/
     const isEditHandler = () => isEdit ? setIsEdit(false) : setIsEdit(true);

     const handleRemoveCollection = (id) => {
         setCollections(collections.filter(collection => collection.id !== id));
 
         // TODO: Add backend call to remove from collection
     }


    /************************************************************
     * Logic for our dialog, including adding new categories
     ***********************************************************/
    // Modal state and functions
    const [open, setOpen] = useState(false);
    // Modal input state and function
    const inputRef = useRef();
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        // Reset the value in the input
        inputRef.current.value = '';
        setOpen(false);
    }
    const changeHandler = (event) => {
        const value = event.target.value;

        inputRef.current.value = value;
    }

    const handleAddCollection = () => {
        setCollections(prevState => [...prevState, {id: Math.random() * 100, name: inputRef.current.value}]);

        // TODO: Send backend call to add category to users collections

        // Close the modal
        handleClose();
    }

    return (
        <React.Fragment>
            <div className='content'>
                <Link to='/collections' className="back">
                    <img src={back} alt="Back symbol" />
                </Link>
                <h2 className='title'>{title}</h2>
                <img src={edit} className="edit" alt='Edit icon' onClick={isEditHandler} />
                <img src={add} className='add' alt='Add icon' onClick={handleOpen} />

                <div className='collections-content'>
                    {
                        collections.length > 0 ? collections.map(collection => (
                            isEdit ? (
                                <div className='collections-item' key={collection.id} onClick={() => { handleRemoveCollection(collection.id) }}>
                                    <img className='remove' alt="Remove Icon" src={remove} />
                                    <div className="collection-text">
                                        {collection.name}
                                    </div>
                                </div>
                            ) : (
                                <Link to={`/collections/${collectionsType}/${collection.name}/${collection.id}`} className='collections-item' key={collection.id} >
                                    <div className="collection-text">
                                        {collection.name}
                                    </div>
                                </Link>
                            )
                        )) : <div>No Collections</div>
                    }
                </div>
            </div>
            <ModalComp 
                open={open} 
                handleClose={handleClose} 
                placeholder="New collection" 
                changeHandler={changeHandler} 
                inputRef={inputRef} 
                handleInput={handleAddCollection} 
                buttonText="Add Collection"
            />
            <Footer />
        </React.Fragment>
    );
}

export default Collections;