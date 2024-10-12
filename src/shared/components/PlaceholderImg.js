import React, { useState } from 'react';
import Loading from './Loading';

const PlaceholderImg = ({ src, alt, classNames, collectionColor, voted, finished }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div>
            {!loaded && <Loading color={collectionColor} type='beat' className='item-loading' size={20} />}
            <img
                src={src}
                className={classNames}
                alt={alt}
                style={(voted && !finished) ? { border: '5px solid #FCB016' } : null}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
};

export default PlaceholderImg;