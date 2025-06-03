import React, { useState, useEffect } from 'react';

import './Category.css';
import { Link } from 'react-router-dom';

// DONE
const Category = props => {
    const [source, setSource] = useState('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Movie%20Outline.png?v=1748914468371') // Default source is movie

    useEffect(() => {
        // Set source to movie, tv, game, or board game depending on props.id
        if(props.id === 'movie') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Movie%20Outline.png?v=1748914468371');
        } else if(props.id === 'tv') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Icon%20TV.svg?v=1727927796766');
        } else if(props.id === 'game') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Icon%20Video%20Game.svg?v=1727926982580');
        } else if(props.id === 'board') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Icon%20Board%20Game.svg?v=1727964155663');
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