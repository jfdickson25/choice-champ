import React from 'react';

import './Input.css';

const Input = props => {
    return (
        <React.Fragment>
            <input key={props.id} id={props.id} placeholder={props.placeholder}/>
        </React.Fragment>
    );
}

export default Input;