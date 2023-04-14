
import React, { useEffect, useState, useRef }  from 'react';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
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
        fetch(`http://localhost:5000/party/${code}`,
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
            console.log(collectionPointRef.current);
            console.log(item);
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

        return () => {
            socket.off('vote-increment');
            socket.off('vote-decrement');
            socket.off('vote-selected');
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
        // Reset votes and voted for all filtered items
        filteredItems.forEach(item => {
            item.votes = 0;
            item.voted = false;
        });

        setCollectionItems(filteredItems);
        collectionPointRef.current = filteredItems;

        socket.emit('vote-remote-selected', votesNeededRef.current);
    }

    const navToParty = () => {
        if(userType === 'owner') {
            // Make a fetch request to the backend to get all the collectionItems for the party
            fetch(`http://localhost:5000/party/${code}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                // Redirect to the home page
                history.push('/party');
            });
        } else {
            history.push('/party');
        }
    }

  return (
    <div className='content'>
        <img src={back} alt="Home symbol" onClick={navToParty} className='back'/>
        <h2 className='title'>Party Code: {code}</h2>
        <img src={dice} className="edit" alt='Dice' />
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
            {[...collectionItems].reverse().map(item => (
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
            ))}
        </div>
        { userType === 'owner' && <Button className='filter-collection-btn' onClick={filterVoted}>Filter Selected</Button> }
    </div>
  )
}

export default Party;