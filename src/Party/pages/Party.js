
import React, { useEffect, useState, useRef }  from 'react';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import Confetti from 'react-confetti';
import back from '../../shared/assets/img/back.svg';
import dice from '../../shared/assets/img/dices.png';

import './Party.css';  

// TODO: Add functionality to randomly select one of the items in the collection and display it on the screen

const Party = ({ socket }) => {
    let history = useHistory();
    // Get the party code and user type from the url
    const { code, userType } = useParams();

    const [collectionItems, setCollectionItems] = useState([]);
    const [votesNeeded, setVotesNeeded] = useState(1);

    const collectionPointRef = useRef(collectionItems);
    const votesNeededRef = useRef(votesNeeded);

    // Log the collections passed from the previous page using useEffect
    useEffect(() => {
        // Make a fetch request to the backend to get all the collectionItems for the party
        fetch(`https://choice-champ-backend.glitch.me/party/${code}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(body => {
            let items = body.items.map(item => {
                return {
                    id: item._id,
                    itemId: item.itemId,
                    title: item.title,
                    poster: item.poster,
                    votes: 0,
                    voted: false
                }
            });

            // Find if there are any duplicate itemIds and remove them
            items = items.filter((item, index, self) => {
                return index === self.findIndex((t) => (
                    t.itemId === item.itemId
                ));
            });

            setCollectionItems(items);
            collectionPointRef.current = items;
        });
    }, []);

    useEffect(() => {
        socket.on('vote-increment', (id) => {
            // Find item with the id and increment the vote count
            const item = collectionPointRef.current.find(item => item.id == id);
            item.votes += 1;
            setCollectionItems([...collectionPointRef.current]);
        });

        socket.on('vote-decrement', (id) => {
            // Find item with the id and decrement the vote count
            const item = collectionPointRef.current.find(item => item.id == id);
            item.votes -= 1;
            setCollectionItems([...collectionPointRef.current]);
        });

        socket.on('vote-selected', (votesNeeded) => {
            // Filter out the items that have been voted for
            const filteredItems = collectionPointRef.current.filter(item => item.votes >= votesNeeded);

            // Reset votes and voted for all filtered items
            filteredItems.forEach(item => {
                item.votes = 0;
                item.voted = false;
            });

            setCollectionItems(filteredItems);
            collectionPointRef.current = filteredItems;
        });

        socket.on('random-selected', (id) => {
            // Find the item with the id and set it to the state
            const item = collectionPointRef.current.find(item => item.id === id);
            setCollectionItems([item]);
            collectionPointRef.current = [item];
        });

        socket.on('party-deleted', () => {
            // Redirect to the party page
            history.push('/party');
        });

        return () => {
            socket.off('vote-increment');
            socket.off('vote-decrement');
            socket.off('vote-selected');
            socket.off('random-selected');
            socket.off('party-deleted');
        }
    }, [socket]);

    const changeCount = (id) => {
        // Find the item with the id and increment vote by one and save it to the state
        const item = collectionItems.find(item => item.id === id);
        // Only increment if the user has not voted
        if (item.voted) {
            item.voted = false;
            item.votes -= 1;
            setCollectionItems([...collectionItems]);
            collectionPointRef.current = [...collectionItems];
            socket.emit('vote-remote-decrement', id);
        } else {
            item.voted = true;        
            item.votes += 1;
            setCollectionItems([...collectionItems]);
            collectionPointRef.current = [...collectionItems];
            socket.emit('vote-remote-increment', id);
        }
    }

    const filterVoted = () => {
        // Filter out the items that have been voted for
        const filteredItems = collectionItems.filter(item => item.votes >= votesNeededRef.current);

        // Check to make sure there are items left in the collection
        if (filteredItems.length === 0) {
            return;
        }

        // Reset votes and voted for all filtered items
        filteredItems.forEach(item => {
            item.votes = 0;
            item.voted = false;
        });

        setCollectionItems(filteredItems);
        collectionPointRef.current = filteredItems;

        // Check if there is only one item left in the collection and delete party from the database
        if (filteredItems.length === 1) {
            // Make a fetch request to the backend to get all the collectionItems for the party
            fetch(`https://choice-champ-backend.glitch.me/party/${code}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        socket.emit('vote-remote-selected', votesNeededRef.current);
    }

    const navToParty = () => {
        if(userType === 'owner' && collectionItems.length > 1) {
            // Make a fetch request to the backend to get all the collectionItems for the party
            fetch(`https://choice-champ-backend.glitch.me/party/${code}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                socket.emit('party-remote-deleted');
                // Redirect to the home page
                history.push('/party');
            });
        }
        else {
            history.push('/party');
        }
    }

    const selectRandom = () => {
        // Don't do anything if there is only one item in the collection
        if (collectionItems.length === 1) {
            return;
        }

        // Randomly select on of the items in the collection and remove the rest
        const randomIndex = Math.floor(Math.random() * collectionItems.length);
        const randomItem = collectionItems[randomIndex];
        // Reset votes and voted for all filtered items
        randomItem.votes = 0;
        randomItem.voted = false;

        setCollectionItems([randomItem]);
        collectionPointRef.current = [randomItem];

        fetch(`https://choice-champ-backend.glitch.me/party/${code}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        socket.emit('random-remote-selected', randomItem.id);
    }

  return (
    <div className='content'>
        { collectionItems.length === 1 && ( <Confetti /> )}
        <img src={back} alt="Back symbol" onClick={navToParty} className='top-left'/>
        <h2 className='title'>Code: {code}</h2>
        { userType === 'owner' && (<img src={dice} className="edit" alt='Dice' onClick={selectRandom} />) }
            { userType === 'owner' && (
                <div className='votes-needed-section'>
                    <p className='votes-needed-title'>Votes Needed</p>
                    <input 
                        type='number'
                        className='votes-needed-input'
                        value={votesNeeded}
                        min={1}
                        max={10}
                        onChange={e => {
                            setVotesNeeded(e.target.value);
                            votesNeededRef.current = e.target.value;
                        }}
                    />
                </div>
            )}
        <div className='collection-content'>
            { 
                collectionItems.length === 1 ? (
                    <div className='winner'>
                        <div
                            className='winner-img'
                            style={{
                                backgroundImage: `url(https://image.tmdb.org/t/p/w500${collectionItems[0].poster})`, 
                                backgroundRepeat: 'no-repeat', 
                                backgroundSize: 'cover'
                            }}
                        >
                        </div>
                        <p className='winner-title'>
                            CHOICE CHAMPION!
                        </p>
                    </div>
                ) : [...collectionItems].reverse().map(item => (
                    <div className='item-section' key={item.id} >
                        <div 
                        className='item-img' 
                        style={
                                item.voted ?
                                {
                                    backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster})`, 
                                    backgroundRepeat: 'no-repeat', 
                                    backgroundSize: 'cover',
                                    border: '5px solid #FCB016'
                                }
                                :
                                {
                                    backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster})`, 
                                    backgroundRepeat: 'no-repeat', 
                                    backgroundSize: 'cover'
                                }
                            }
                        onClick={changeCount.bind(this, item.id)}
                        >
                        <p>{item.title}</p>
                        { item.votes > 0 && <div className='item-votes'>{item.votes}</div> }
                        </div>
                    </div>
                ))
            }
        </div>
        { userType === 'owner' && <Button className='filter-collection-btn' onClick={filterVoted}>Filter Selected</Button> }
    </div>
  )
}

export default Party;