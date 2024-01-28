import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Dialog } from '@mui/material';
import Loading from '../../shared/components/Loading';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';

import './Collections.css';
import { AuthContext } from '../../shared/context/auth-context';
import Button from '../../shared/components/FormElements/Button';

const Collections = props => {
    const auth = useContext(AuthContext);
    let navigate = useNavigate();

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
    const [isLoading, setIsLoading] = useState(true);

    // State for error messages
    const [nameError, setNameError] = useState(null);
    const [joinError, setJoinError] = useState('');
    const [navingBack, setNavingBack] = useState(false);

    // Empty array will only run on the initial render
    useEffect(() => {
        auth.showFooterHandler(true);
        
        // Set the title depending on the type
        if(collectionsType === 'movie') {
            setTitle('Movie Collections')
        } else if(collectionsType === 'tv') {
            setTitle('TV Collections')
        } else if(collectionsType === 'game') {
            setTitle('Game Collections')
        } else if(collectionsType === 'board') {
            setTitle('Board Game Collections')
        }
        
        // Make a fetch post request to collections with the userId and setCollections to the response
        fetch(`https://choice-champ-backend.glitch.me/collections/${collectionsType}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setCollections(data.collections);
            setIsLoading(false);
        });
    }, [auth, collectionsType]);

    /************************************************************
     * Logic for setting edit state and removing movies
     ***********************************************************/
     const isEditHandler = () => isEdit ? setIsEdit(false) : setIsEdit(true);

     const handleRemoveCollection = (id) => {
            // Send a fetch delete request to collections with the userId and the collection id
            fetch(`https://choice-champ-backend.glitch.me/collections/${collectionsType}/${auth.userId}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(data => {
                // Remove the collection from the collections array
                setCollections(collections.filter(collection => collection._id !== id));
            })
            .catch(err => {
                console.log(err);
            }
        )
     }


    /************************************************************
     * Logic for our dialog, including adding new categories
     ***********************************************************/
    // Modal state and functions
    const [open, setOpen] = useState(false);
    // Modal input state and function
    const inputCollectionRef = useRef();
    const inputJoinRef = useRef();
    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        // Reset the value in the input
        inputCollectionRef.current.value = '';
        inputJoinRef.current.value = null;
        setNameError(false);
        setJoinError('');
        setOpen(false);
    }

    const changeCollectionHandler = (event) => {
        const value = event.target.value;

        inputCollectionRef.current.value = value;
    }

    const changeJoinCodeHandler = (event) => {
        const value = event.target.value;

        inputJoinRef.current.value = value;
    }

    const handleAddCollection = () => {

        // Only add if the input is not empty and the collection does not already exist
        if(inputCollectionRef.current.value === '' || collections.find(collection => collection.name === inputCollectionRef.current.value)) {
            setNameError(true);
            return;
        }

        // Send a fetch post request to collections with the userId and the new collection name
        fetch(`https://choice-champ-backend.glitch.me/collections/${auth.userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: inputCollectionRef.current.value,
                type: collectionsType
            })
        })
        .then(res => res.json())
        .then(data => {
            // Add the new collection to the collections array
            setCollections([...collections, data.collection]);
        })
        .catch(err => {
            console.log(err);
        });


        // Close the modal
        handleClose();
    }

    const handleJoinCollection = () => {

        // Check that the code is five digits long
        if(inputJoinRef.current.value.length !== 5) {
            setJoinError('Code must be 5 digits long');
            return;
        }

        // Send a fetch post request to collections with the userId and the new collection name
        fetch(`https://choice-champ-backend.glitch.me/collections/join/${inputJoinRef.current.value}/${collectionsType}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.errMsg) {
                setJoinError(data.errMsg);
                return;
            } else {
                // Add the new collection to the collections array
                setCollections([...collections, data.collection]);
                // Close the modal
                handleClose();
            }
        })
        .catch(err => {
            console.log(err);
        });
    }

    const navBack = () => {
        setNavingBack(true);
        setTimeout(() => {
            setNavingBack(false);
            navigate('/collections');
        }, 1000);
    }

    const moveLeft = (id) => {
        // Find the collection with the id parameter
        const collection = collections.find(collection => collection._id === id);
        // Move the collection to the left in the collections array
        const index = collections.indexOf(collection);
        if(index === 0) {
            return;
        }
        const newCollections = [...collections];
        newCollections.splice(index, 1);
        newCollections.splice(index - 1, 0, collection);
        setCollections(newCollections);

        // Send a fetch post request with the userId and the collection id to move the collection left
        fetch(`https://choice-champ-backend.glitch.me/collections/moveLeft/${collectionsType}/${auth.userId}/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(data => {
            setCollections(newCollections);
        })
        .catch(err => {
            console.log(err);
        });
    }

    const moveRight = (id) => {
        // Find the collection with the id parameter
        const collection = collections.find(collection => collection._id === id);
        // Move the collection to the right in the collections array
        const index = collections.indexOf(collection);
        if(index === collections.length - 1) {
            return;
        }
        const newCollections = [...collections];
        newCollections.splice(index, 1);
        newCollections.splice(index + 1, 0, collection);
        setCollections(newCollections);

        // Send a fetch post with the userId and collection id to move the collection to the right
        fetch(`https://choice-champ-backend.glitch.me/collections/moveRight/${collectionsType}/${auth.userId}/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(data => {
            setCollections(newCollections);
        })
        .catch(err => {
            console.log(err);
        });
    }

    return (
        <React.Fragment>
            <div className='content'>
                {
                    navingBack ? 
                    (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button-active.png?v=1702137193420" alt="Back symbol" className="top-left clickable" style={{animation: 'button-press .75s'}} />) : 
                    (<img src="https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/back-button.png?v=1702137134668" alt="Back symbol" className="top-left clickable" onClick={navBack} />)
                }
                <h2 className='title'>{title}</h2>
                <img src={ isEdit ? editing :  edit } className="edit clickable" alt='Edit icon' onClick={isEditHandler} style={isEdit ? {animation: 'button-press .75s'} : null} />
                {
                    open ? 
                        <img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/plus-button-active.png?v=1702137827635' className='add clickable' alt='Add icon' style={{animation: 'button-press .75s'}} />
                    :
                    <img src='https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/plus-button.png?v=1702138169050' className='add clickable' alt='Add icon' onClick={handleOpen} />
                }

                {
                    isLoading ? <Loading type='beat' className='list-loading' size={20} /> : 
                    (<div className='collections-content'>
                        {
                            collections.length > 0 ? collections.map((collection, index) => (
                                isEdit ? (
                                    <div className='collections-item' key={collection._id}>
                                        <img className='remove' alt="Remove Icon" onClick={() => { handleRemoveCollection(collection._id) }} src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433' />
                                        { index !== 0 && <img className='left' alt="left arrow" onClick={() => { moveLeft(collection._id) }} src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/left.png?v=1692161740511' /> }
                                        <div className="collection-text">
                                            {collection.name}
                                        </div>
                                        { index !== collections.length - 1 && <img className='right' alt="right arrow" onClick={ () => { moveRight(collection._id) } } src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/right.png?v=1692161745669' /> }
                                    </div>
                                ) : (
                                    <Link to={`/collections/${collectionsType}/${collection.name}/${collection._id}`} className='collections-item' key={collection._id} >
                                        <div className="collection-text">
                                            {collection.name}
                                        </div>
                                    </Link>
                                )
                            )) : <div className='no-collections-txt'>No Collections</div>
                        }
                    </div>)
                }
            </div>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <input type="text" placeholder={"collection name"} onChange={changeCollectionHandler} ref={inputCollectionRef}/>
                        <Button onClick={handleAddCollection}>Create Collection</Button>
                        {nameError && <p className='error' style={{textAlign: 'center'}}>Collection must have a name</p>}
                        <p className='or'>OR</p>
                        <input type="number" min={10000} max={99999} placeholder={"share code"} onChange={changeJoinCodeHandler} ref={inputJoinRef}/>
                        <Button onClick={handleJoinCollection}>Join Collection</Button>
                        <p className='error' style={{textAlign: 'center'}}>{joinError}</p>
                    </div>
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default Collections;