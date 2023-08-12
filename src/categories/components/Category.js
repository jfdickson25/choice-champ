import React from 'react';

import './Category.css';
import { Link } from 'react-router-dom';

// DONE
const Category = props => {
    return (
        <Link to={`/collections/${props.id}`} className='category' id={props.id} >
            <div className='category-overlay'>
                <img 
                    className='category-img' 
                    src={ 
                        props.id === 'movie' ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/movie.png?v=1682271238203' 
                        : ( props.id === 'tv' ? 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/tv.png?v=1682271238537' 
                        : 'https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/game.png?v=1682271237845') } 
                    alt={props.title}
                />
            </div>
        </Link>
    );
}

export default Category;