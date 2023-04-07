import React from 'react';

import './Button.css';

const Button = props => {
    return (
        <button 
            type={props.type} 
            disabled={props.disabled}
            onClick={props.onClick}
            className={props.className}
        >
            {props.children}
        </button>
    );
}

export default Button;