import React, { useState } from 'react';
import Loading from './Loading';

const PlaceholderImg = ({ src, alt, classNames, collectionColor, styleSettings }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div>
            {!loaded && <Loading color={collectionColor} type='beat' className='item-loading' size={20} />}
            <img
                src={src}
                className={classNames}
                alt={alt}
                style={loaded ? {} : { display: 'none', ...styleSettings }}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
};

export default PlaceholderImg;