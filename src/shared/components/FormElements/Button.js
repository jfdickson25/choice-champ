import React, { useState } from 'react';

import './Button.css';

const Button = props => {
    const [bounce, setBounce] = useState(false);

    const action = () => {
        if (props.onClick) {
            setBounce(true);
            setTimeout(() => {
                setBounce(false);
                props.onClick();
            }, 1000);
        }
    }

    return (
        <React.Fragment>
            { 
                bounce ? (
                    <button 
                        type={props.type} 
                        disabled={props.disabled}
                        className={props.className}
                        style={ props.backgroundColor ? {animation: 'button-press .75s', backgroundColor: props.backgroundColor} : {animation: 'button-press .75s', backgroundColor: '#dd9b14' }}
                    >
                        {props.children}
                    </button>
                ) : (
                    <button 
                        type={props.type} 
                        disabled={props.disabled}
                        onClick={action}
                        className={props.className}
                    >
                        {props.children}
                    </button>

            )}
        </React.Fragment>
    );
}

export default Button;