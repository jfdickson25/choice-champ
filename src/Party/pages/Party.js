
import React, { useEffect, useState }  from 'react';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import back from '../../shared/assets/img/back.svg';

import './Party.css';  

// TODO: Add functionality to randomly select one of the items in the collection and display it on the screen

const Party = (props) => {
    let history = useHistory();

    // Get the party code and user type from the url
    const { code, userType } = useParams();

    const [collectionItems, setCollectionItems] = useState([]);

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
        });
    }, []);

    const changeCount = (id) => {
        // Find the item with the id and increment vote by one and save it to the state
        const item = collectionItems.find(item => item.id === id);
        // Only increment if the user has not voted
        if (item.voted) {
            item.voted = false;
            item.votes -= 1;
            setCollectionItems([...collectionItems]);
        } else {
            item.voted = true;        
            item.votes += 1;
            setCollectionItems([...collectionItems]);
        }
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
        { userType === 'owner' && <Button className='filter-collection-btn'>Filter Selected</Button> }
    </div>
  )
}

export default Party;