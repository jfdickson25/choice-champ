import React, { useState, useEffect } from 'react';

import './Category.css';
import { Link } from 'react-router-dom';

// DONE
const Category = props => {
    const [source, setSource] = useState('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Movie%20Outline.svg?v=1727844493723') // Default source is movie

    useEffect(() => {
        // Set source to movie, tv, game, or board game depending on props.id
        if(props.id === 'movie') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Movie%20Outline.svg?v=1727844493723');
        } else if(props.id === 'tv') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20TV%20Outline.svg?v=1727844330904');
        } else if(props.id === 'game') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Video%20Game%20Outline.svg?v=1727844327632');
        } else if(props.id === 'board') {
            setSource('https://cdn.glitch.global/ebf12691-ad1e-4a83-81e2-641b9d7c5f64/Choice%20Champ%20Category%20Board%20Game%20Outline.svg?v=1727844323131');
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