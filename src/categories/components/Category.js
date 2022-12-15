import React from 'react';

import './Category.css';
import { Link } from 'react-router-dom';

const Category = props => {
    return (
        <Link to={`/collections/${props.id}`} className='category' key={props.id} id={props.id} >
            <div className='category-overlay' />
        </Link>
    );
}

export default Category;