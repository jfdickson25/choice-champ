
import React, { useEffect, useState, useRef, useContext }  from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import Confetti from 'react-confetti';
import back from '../../shared/assets/img/back.svg';
import dice from '../../shared/assets/img/dices.png';

import { AuthContext } from '../../shared/context/auth-context';

import './Party.css';  

// TODO: Add functionality to randomly select one of the items in the collection and display it on the screen

const Party = ({ socket }) => {
    const auth = useContext(AuthContext);
    let history = useHistory();
    // Get the party code and user type from the url
    const { code, userType } = useParams();

    const [collectionItems, setCollectionItems] = useState([]);
    const [mediaType, setMediaType] = useState('movie');
    const [votesNeeded, setVotesNeeded] = useState(1);
    const [secretMode, setSecretMode] = useState(false);

    const [runnerUps, setRunnerUps] = useState([]);

    const collectionPointRef = useRef(collectionItems);
    const votesNeededRef = useRef(votesNeeded);

    // Log the collections passed from the previous page using useEffect
    useEffect(() => {
        auth.showFooterHandler(false);
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
            let items = body.party.items.map(item => {
                return {
                    id: item._id,
                    itemId: item.itemId,
                    title: item.title,
                    poster: item.poster,
                    watched: item.watched,
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

            // If body.party.IncludeWatched is false then filter out the items that have been watched
            if(!body.party.includeWatched) {
                items = items.filter(item => !item.watched);
            }

            // Randomize the order of the items
            items = items.sort(() => Math.random() - 0.5);

            setMediaType(body.party.mediaType);
            setSecretMode(body.party.secretMode);
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

            if(filteredItems.length === 1) {
                // Set runners up to the remaining items
                const runnerUps = collectionPointRef.current.filter(item => item.votes < votesNeeded);
                setRunnerUps(runnerUps);
            }

            setCollectionItems(filteredItems);
            collectionPointRef.current = filteredItems;
        });

        socket.on('random-selected', (id) => {
            // Find the item with the id and set it to the state
            const item = collectionPointRef.current.find(item => item.id === id);

            // Set the rest of the items that are not the random item to be the runner ups
            const runnerUps = collectionPointRef.current.filter(item => item.id !== id);
            setRunnerUps(runnerUps);

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

        if(filteredItems.length === 1) {
            // Set runners up to the remaining items
            const runnerUps = collectionItems.filter(item => item.votes < votesNeededRef.current);
            setRunnerUps(runnerUps);
        }

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

        // Set the rest of the items that are not the random item to be the runner ups
        const runnerUps = collectionItems.filter(item => item.id !== randomItem.id);
        setRunnerUps(runnerUps);

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
        <div className='collection-content' style={mediaType === 'game' ? { gridTemplateColumns: 'repeat(1, 1fr)'} : { gridTemplateColumns: 'repeat(2, 1fr)'} }>
            { 
                collectionItems.length === 1 ? (
                    <div className='winner'>
                        <div
                            className={ mediaType === 'game' ? 'winner-img-game' :'winner-img' }
                            style={{
                                backgroundImage: `url(${collectionItems[0].poster})`, 
                                backgroundRepeat: 'no-repeat', 
                                backgroundSize: 'cover'
                            }}
                        >
                        </div>
                        <p className='winner-title'>{collectionItems[0].title}</p>
                        <p className='winner-banner'>
                            CHOICE CHAMPION!
                        </p>
                        <p className='runner-up-title'>
                            Runner Ups
                        </p>
                        { runnerUps.length > 0 && (
                            runnerUps.map(item => (
                                <p className='runner-up' key={item.id}>
                                    { item.title }
                                </p>
                            ))
                        )}
                    </div>
                ) : [...collectionItems].reverse().map(item => (
                    <div className='item-section' key={item.id} >
                        <div 
                        className='item-img' 
                        style={
                                item.voted ?
                                {
                                    backgroundImage: `url(${item.poster})`, 
                                    backgroundRepeat: 'no-repeat', 
                                    backgroundSize: 'cover',
                                    border: '5px solid #FCB016'
                                }
                                :
                                {
                                    backgroundImage: `url(${item.poster})`, 
                                    backgroundRepeat: 'no-repeat', 
                                    backgroundSize: 'cover'
                                }
                            }
                        onClick={changeCount.bind(this, item.id)}
                        >
                        <p>{item.title}</p>
                        { (item.votes > 0 && !secretMode) && <div className='item-votes'>{item.votes}</div> }
                        </div>
                    </div>
                ))
            }
        </div>
        { (userType === 'owner' && collectionItems.length > 1) && <Button className='filter-collection-btn' onClick={filterVoted}>Filter Selected</Button> }
    </div>
  )
}

export default Party;