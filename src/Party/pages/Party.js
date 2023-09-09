
import React, { useEffect, useState, useRef, useContext }  from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import Confetti from 'react-confetti';
import back from '../../shared/assets/img/back.svg';
import dice from '../../shared/assets/img/dices.png';
import Loading from '../../shared/components/Loading';
// import Shake from 'react-reveal/Shake';

import { AuthContext } from '../../shared/context/auth-context';

import './Party.css';  

const Party = ({ socket }) => {
    const auth = useContext(AuthContext);
    let navigate = useNavigate();
    // Get the party code and user type from the url
    const { code, userType } = useParams();

    const [collectionItems, setCollectionItems] = useState([]);
    const [mediaType, setMediaType] = useState('movie');
    const [votesNeeded, setVotesNeeded] = useState(1);
    const [secretMode, setSecretMode] = useState(false);
    const [ready, setReady] = useState(false);
    // State to track the number of users that have clicked the voting finished button
    const [usersReadyCount, setUsersReadyCount] = useState(0);
    // State to track the total number of users in the party, this is grabbed from the backend
    // party object. Users may leave, so if anyone reloads the page, the totalUsers will be reset to
    // an incorrect value.
    const [totalUsers, setTotalUsers] = useState(0);
    const [runnerUps, setRunnerUps] = useState([]);

    const [slideDown, setSlideDown] = useState(false);
    const [randomSelected, setRandomSelected] = useState(false);

    const collectionPointRef = useRef(collectionItems);
    const votesNeededRef = useRef(votesNeeded);
    const usersReadyCountRef = useRef(usersReadyCount);
    const totalUsersRef = useRef(totalUsers);
  
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
            setTotalUsers(body.party.memberCount);
            totalUsersRef.current = body.party.memberCount;
            setCollectionItems(items);
            collectionPointRef.current = items;
          
            // Join the party room. This will restrict the same movie getting voted in different parties
            socket.emit('join-room', code);
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

        socket.on('votes-needed', (votesNeeded) => {
            setVotesNeeded(votesNeeded);
            votesNeededRef.current = votesNeeded;
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
            socket.emit('leave-room', code);

            setRandomSelected(true);

            setTimeout(() => {
                setSlideDown(true);
                setTimeout(() => {
                    // Find the item with the id and set it to the state
                    const item = collectionPointRef.current.find(item => item.id === id);

                    // Set the rest of the items that are not the random item to be the runner ups
                    const runnerUps = collectionPointRef.current.filter(item => item.id !== id);
                    setRunnerUps(runnerUps);

                    setCollectionItems([item]);
                    collectionPointRef.current = [item];
                }, 2000);
            }, 1000);
        });

        socket.on('user-ready', () => {
            usersReadyCountRef.current += 1;
            setUsersReadyCount(usersReadyCountRef.current);

            // If the usersReadyCount is equal to the totalUsers then filter all the items that have
            // less votes than the votesNeeded. Reset the votes and voted for all filtered items
            if(usersReadyCountRef.current == totalUsersRef.current) {
                setTimeout(() => {

                    // Set slideDown to true to slide down the ready overlay
                    setSlideDown(true);
                    setTimeout(() => {
                        // Filter out the items that have been voted for
                        const filteredItems = collectionPointRef.current.filter(item => item.votes >= votesNeededRef.current);

                        // Check to make sure there are items left in the collection
                        if (filteredItems.length === 0) {
                            setReady(false);
                            return;
                        } else if(filteredItems.length === 1) {
                            // Set runners up to the remaining items
                            const runnerUps = collectionPointRef.current.filter(item => item.votes < votesNeededRef.current);
                            setRunnerUps(runnerUps);
                        } else {
                            // Reset votes and voted for all filtered items
                            filteredItems.forEach(item => {
                                item.votes = 0;
                                item.voted = false;
                            });

                            setUsersReadyCount(0);
                            usersReadyCountRef.current = 0;
                        }

                        // No matter what set the collection items to the filtered items
                        setCollectionItems(filteredItems);
                        collectionPointRef.current = filteredItems;

                        // Set ready to false whether there is one or more items left in the collection
                        setReady(false);
                        setSlideDown(false);
                    }, 2000);
                }, 1000);
            }
        });

        socket.on('user-not-ready', () => {
            usersReadyCountRef.current -= 1;
            setUsersReadyCount(usersReadyCountRef.current);
        });

        socket.on('party-member-left', () => {
            setTotalUsers(totalUsersRef.current - 1);
            totalUsersRef.current -= 1;
        });

        socket.on('party-deleted', () => {
            socket.emit('leave-room', code);
            // Redirect to the party page
            navigate('/party');
        });

        return () => {
            socket.off('vote-increment');
            socket.off('vote-decrement');
            socket.off('votes-needed');
            socket.off('vote-selected');
            socket.off('random-selected');
            socket.off('party-deleted');
            socket.off('clear-votes');
            socket.off('user-ready');
            socket.off('user-not-ready');
            socket.off('party-member-left');
        }
    }, []);

    const changeCount = (id) => {
        // Find the item with the id and increment vote by one and save it to the state
        const item = collectionItems.find(item => item.id === id);
        // Only increment if the user has not voted
        if (item.voted) {
            item.voted = false;
            item.votes -= 1;
            setCollectionItems([...collectionItems]);
            collectionPointRef.current = [...collectionItems];
            socket.emit('vote-remote-decrement', id, code);
        } else {
            item.voted = true;        
            item.votes += 1;
            setCollectionItems([...collectionItems]);
            collectionPointRef.current = [...collectionItems];
            socket.emit('vote-remote-increment', id, code);
        }
    }

    const userReady = () => {
        // Set the user to ready
        setReady(true);
        // Increase usersReadyCount by one
        usersReadyCountRef.current += 1;
        setUsersReadyCount(usersReadyCountRef.current)

        // If the usersReadyCount is equal to the totalUsers then filter all the items that have
        // less votes than the votesNeeded. Reset the votes and voted for all filtered items
        if(usersReadyCountRef.current == totalUsersRef.current) {
            setTimeout(() => {

                // Set slideDown to true to slide down the ready overlay
                setSlideDown(true);
                setTimeout(() => {
                    // Filter out the items that have been voted for
                    const filteredItems = collectionItems.filter(item => item.votes >= votesNeededRef.current);

                    // Check to make sure there are items left in the collection
                    if (filteredItems.length === 0) {
                        setReady(false);
                        return;
                    } else if(filteredItems.length === 1) {
                        // Set runners up to the remaining items
                        const runnerUps = collectionItems.filter(item => item.votes < votesNeededRef.current);
                        setRunnerUps(runnerUps);

                        // Make a fetch request to delete the party from the database
                        fetch(`https://choice-champ-backend.glitch.me/party/${code}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });
                    } else {
                        // Reset votes and voted for all filtered items
                        filteredItems.forEach(item => {
                            item.votes = 0;
                            item.voted = false;
                        });

                        setUsersReadyCount(0);
                        usersReadyCountRef.current = 0;
                    }

                    setCollectionItems(filteredItems);
                    collectionPointRef.current = filteredItems;

                    setReady(false);
                    setSlideDown(false);
                }, 2000);
            }, 1000);
        }

        // Emit event to the server that the user is ready
        socket.emit('user-ready-remote', code);
    }

    const userNotReady = () => {
        // Set the user to not ready
        setReady(false);

        // Decrease usersReadyCount by one
        usersReadyCountRef.current -= 1;
        setUsersReadyCount(usersReadyCountRef.current);

        // Emit event to the server that the user is not ready
        socket.emit('user-not-ready-remote', code);
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
                socket.emit('leave-room', code);
                socket.emit('party-remote-deleted', code);
                // Redirect to the home page
                navigate('/party');
            });
        }
        else {
            socket.emit('user-leave-party', code);
            socket.emit('leave-room', code);
            navigate('/party');
        }
    }

    const selectRandom = () => {
        // Don't do anything if there is only one item in the collection
        if (collectionItems.length === 1) {
            return;
        }

        setRandomSelected(true);

        // Randomly select on of the items in the collection and remove the rest
        const randomIndex = Math.floor(Math.random() * collectionItems.length);
        const randomItem = collectionItems[randomIndex];
        // Reset votes and voted for all filtered items
        randomItem.votes = 0;
        randomItem.voted = false;

        // Set the rest of the items that are not the random item to be the runner ups
        const runnerUps = collectionItems.filter(item => item.id !== randomItem.id);

        setTimeout(() => {
            setSlideDown(true);
            setTimeout(() => {
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
            }, 2000);
        }, 1000);

        socket.emit('random-remote-selected', randomItem.id, code);
    }

  return (
    <div className='content'>
        { collectionItems.length === 1 && ( <Confetti /> )}
        <img src={back} alt="Back symbol" onClick={navToParty} className='top-left'/>
        { (userType === 'owner' && collectionItems.length > 1) ? (
            <div className='votes-needed-section'>
                <p className='votes-needed-title'>Votes Needed</p>
                <input 
                    type='number'
                    className='votes-needed-input'
                    value={votesNeeded}
                    min={1}
                    onChange={e => {
                        setVotesNeeded(e.target.value);
                        votesNeededRef.current = e.target.value;
                        // Check if e.target.value is a number
                        if (isNaN(e.target.value) || e.target.value === '') {
                            return;
                        } else {
                            socket.emit('votes-needed-remote', e.target.value, code);
                        }
                    }}
                />
            </div>)
            : <div className='guest-banner'></div>
        }
        { (userType === 'owner' && collectionItems.length > 1) && (<img src={dice} className="edit" alt='Dice' onClick={selectRandom} />) }
        <div className={mediaType === 'game' ? 'collection-content-game' : 'collection-content-other' }>
            { 
                collectionItems.length === 1 ? (
                    <div className='winner'>
                        <p className='winner-banner'>
                            CHOICE CHAMPION!
                        </p>
                        <img
                            className={ mediaType === 'game' ? 'winner-img-game' :'winner-img' }
                            src={collectionItems[0].poster}
                        />
                        <p className='winner-title'>{collectionItems[0].title}</p>
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
                        <img 
                            className='item-img' 
                            src={item.poster} 
                            onClick={changeCount.bind(this, item.id)}
                            style={item.voted ? { border: '5px solid #FCB016' } : null}
                        />
                        {(mediaType === 'game' || mediaType === 'board') && <p style={item.voted ? { borderLeft: '5px solid #FCB016', borderRight: '5px solid #FCB016', borderBottom: '5px solid #FCB016', borderRadius: '0px 0px 9px 9px' } : null}>{item.title}</p>}
                        { (item.votes > 0 && !secretMode) && <div className='item-votes'>{item.votes}</div> }
                    </div>
                ))
            }
        </div>
        { 
            (collectionItems.length > 1) && ( 
                !ready ? ( !randomSelected ? <Button className='finish-voting-btn' onClick={userReady}>Finish Voting</Button> : null )
                : <div 
                    className='ready-overlay' 
                    onClick={ totalUsers > 1 ? userNotReady : null} 
                    style={ 
                        // If slide down is true translate the overlay down 100vh make the transition smooth over 2 seconds
                        slideDown ? { transform: 'translateY(100vh)', transition: 'transform 2s ease-in-out' } : null
                    }
                >
                    {totalUsers === 1 
                        ? 
                            <React.Fragment>
                            <h1 className='ready-text' style={{marginBottom: '30px'}}>Filtering Items</h1>
                            <Loading type='beat' className='ready-loading' size={20} speed={.5} />
                            </React.Fragment>
                        : 
                            <React.Fragment>
                            <h1 className='ready-text'>Ready!</h1>
                            <p className='waiting-text'>Waiting on other party members...</p>
                            <p className='waiting-text-cancel'>Click to return to voting</p>
                            <Loading type='sync' className='ready-loading' size={20} speed={.5} />
                            </React.Fragment>
                    }
                </div> 
            ) 
        }
        {
            randomSelected && (
                <div 
                    className='ready-overlay'
                    style={ 
                        // If slide down is true translate the overlay down 100vh make the transition smooth over 2 seconds
                        slideDown ? { transform: 'translateY(100vh)', transition: 'transform 2s ease-in-out' } : null
                    }
                >
                    <img src={dice} className='random-selected-dice' alt='Dice' />
                </div>
            )
        }
    </div>
  )
}

export default Party;