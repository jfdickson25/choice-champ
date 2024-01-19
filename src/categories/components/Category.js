import React, { useState, useEffect } from 'react';

import './Category.css';
import { Link } from 'react-router-dom';

// DONE
const Category = props => {
    const [source, setSource] = useState('https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/movie.png?v=1682271238203') // Default source is movie

    useEffect(() => {
        // Set source to movie, tv, game, or board game depending on props.id
        if(props.id === 'movie') {
            setSource('https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/movie.png?v=1682271238203');
        } else if(props.id === 'tv') {
            setSource('https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/tv.png?v=1682271238537');
        } else if(props.id === 'game') {
            setSource('https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/game.png?v=1682271237845');
        } else if(props.id === 'board') {
            setSource('https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/pawn.png?v=1691967359871');
        }
    }, []);

    return (
        <Link to={`/collections/${props.id}`} className='category'>
            <div className='category-overlay' id={props.id} >
                <img 
                    className='category-img' 
                    src={source} 
                    alt={props.title}
                />
            </div>
        </Link>
    );
}

export default Category;