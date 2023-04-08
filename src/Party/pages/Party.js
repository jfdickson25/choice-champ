
import React, { useEffect, useState }  from 'react';
import { useParams, NavLink } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';

import back from '../../shared/assets/img/back.svg';

import './Party.css';

const Party = (props) => {

    // Get the party code and user type from the url
    const { code, userType } = useParams();

    const [collectionItems, setCollectionItems] = useState([]);

    // Log the collections passed from the previous page using useEffect
    useEffect(() => {
        // TODO: This will be replaced by searching the collections from the backend
        // Make a fetch request to the backend to get all the collectionItems for the party
        // fetch('http://localhost:5000/api/getCollectionItems')
        // .then(response => response.json())
        // .then(res => {
        //     // Add selected to each collection
        //     res.collections.forEach(collection => {
        //         collection.selected = false;
        //     });

        //     setCollections(res.collections);
        // });

        // Set the collections to the default values
        setCollectionItems([
          {
            id: 268,
            title: 'Batman',
            poster: '/cij4dd21v2Rk2YtUQbV5kW69WB2.jpg',
            votes: 0,
            voted: false
        },
        {
           id:  2661,
           title: 'Batman',
           poster: '/zzoPxWHnPa0eyfkMLgwbNvdEcVF.jpg',
           votes: 0,
           voted: false
        },
        {
            id: 125249,
            title: 'Batman',
            poster: '/6XYL5JRHxaLLd0ZwsBugaAuGHTa.jpg',
            votes: 0,
            voted: false
        },
        {
            id: 1003579,
            title: 'Batman: The Doom That Came to Gotham',
            poster: '/hrATQE8ScQceohwInaMluluNEaf.jpg',
            votes: 0,
            voted: false
        },
        {
            id: 414906,
            title: 'The Batman',
            poster: '/74xTEgt7R36Fpooo50r9T25onhq.jpg',
            votes: 0,
            voted: false
        },
        {
            id: 886396,
            title: 'Batman and Superman: Battle of the Super Sons',
            poster: '/mvffaexT5kA3chOnGxwBSlRoshh.jpg',
            votes: 0,
            voted: false
        },
        {
            id: 209112,
            title: 'Batman v Superman: Dawn of Justice',
            poster: '/5UsK3grJvtQrtzEgqNlDljJW96w.jpg',
            votes: 0,
            voted: false
        },
        {
            id: 485942,
            title: 'Batman Ninja',
            poster: '/5xSB0Npkc9Fd9kahKBsq9P4Cdzp.jpg',
            votes: 0,
            voted: false
        },
        {
            id: 272,
            title: 'Batman Begins',
            poster: '/8RW2runSEc34IwKN2D1aPcJd2UL.jpg',
            votes: 0,
            voted: false
        }
        ]);

    }, []);

    const incrementCount = (id) => {
        // Find the item with the id and increment vote by one and save it to the state
        const item = collectionItems.find(item => item.id === id);
        // Only increment if the user has not voted
        if (item.voted) return;
        item.voted = true;        
        item.votes += 1;
        setCollectionItems([...collectionItems]);
    }



  return (
    <div className='content'>
        <NavLink to={'/party'} className="back">
            <img src={back} alt="Back symbol" />
        </NavLink>
        <h2 className='title'>Party Code: {code}</h2>
        <div className='collection-content'>
            {[...collectionItems].reverse().map(item => (
                <div className='item-section' key={item.id} >
                    <div 
                      className='item-img' 
                      style={{backgroundImage: `url(https://image.tmdb.org/t/p/w500${item.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}
                      onClick={incrementCount.bind(this, item.id)}
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