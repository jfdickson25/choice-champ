import React from 'react';
import { BounceLoader } from 'react-spinners';

import './Loading.css';

const Loading = props => {
    return (
        <div className='loading'>
            <BounceLoader color="#FCB016" size={props.size} />
        </div>
    );
}

export default Loading;