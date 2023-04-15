import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { Dialog } from '@mui/material';
import Footer from '../../shared/components/Navigation/Footer';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import remove from '../../shared/assets/img/remove.png';
import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';

import './Collections.css';
import { AuthContext } from '../../shared/context/auth-context';

const Collections = props => {
    const auth = useContext(AuthContext);
    let history = useHistory();

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
        // Set the title depending on the type
        if(collectionsType === 'movie') {
            setTitle('Movie Collections')
        } else if(collectionsType === 'tv') {
            setTitle('TV Collections')
        } else if(collectionsType === 'game') {
            setTitle('Game Collections')
        }
        
        // Make a fetch post request to localhost:5000/collections with the userId and setCollections to the response
        fetch(`https://choice-champ-backend.glitch.me/collections/${collectionsType}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            setCollections(data.collections);
        });
    }, [collectionsType]);

    /************************************************************
     * Logic for setting edit state and removing movies
     ***********************************************************/
     const isEditHandler = () => isEdit ? setIsEdit(false) : setIsEdit(true);

     const handleRemoveCollection = (id) => {
         // Send a fetch delete request to localhost:5000/collections with the userId and the collection id
            fetch(`https://choice-champ-backend.glitch.me/collections/${auth.userId}/${id}`, {
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
            return;
        }

        // Send a fetch post request to localhost:5000/collections with the userId and the new collection name
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

        // Send a fetch post request to localhost:5000/collections with the userId and the new collection name
        fetch(`https://choice-champ-backend.glitch.me/collections/join/${inputJoinRef.current.value}/${auth.userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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

    

    const navBack = () => {
        history.push('/collections');
    }

    return (
        <React.Fragment>
            <div className='content'>
                <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
                <h2 className='title'>{title}</h2>
                <img src={ isEdit ? editing :  edit } className="edit" alt='Edit icon' onClick={isEditHandler} />
                <img src={add} className='add' alt='Add icon' onClick={handleOpen} />

                <div className='collections-content'>
                    {
                        collections.length > 0 ? collections.map(collection => (
                            isEdit ? (
                                <div className='collections-item' key={collection._id} onClick={() => { handleRemoveCollection(collection._id) }}>
                                    <img className='item-action' alt="Remove Icon" src={remove} />
                                    <div className="collection-text">
                                        {collection.name}
                                    </div>
                                </div>
                            ) : (
                                <Link to={`/collections/${collectionsType}/${collection.name}/${collection._id}`} className='collections-item' key={collection._id} >
                                    <div className="collection-text">
                                        {collection.name}
                                    </div>
                                </Link>
                            )
                        )) : <div style={{textAlign: 'center', gridColumn: '1/4', fontWeight: 'bold'}}>No Collections</div>
                    }
                </div>
            </div>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <input type="text" placeholder={"New Collection"} onChange={changeCollectionHandler} ref={inputCollectionRef}/>
                        <button onClick={handleAddCollection}>Create Collection</button>
                        <p className='or'>OR</p>
                        <input type="number" min={10000} max={99999} placeholder={12345} onChange={changeJoinCodeHandler} ref={inputJoinRef}/>
                        <button onClick={handleJoinCollection}>Join Collection</button>
                    </div>
                </div>
            </Dialog>
            <Footer />
        </React.Fragment>
    );
}

export default Collections;