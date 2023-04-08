import React, { useRef, useState, useEffect } from 'react'
import { NavLink, useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';

import back from '../../shared/assets/img/back.svg';

import './JoinParty.css';

const JoinParty = (props) => {

    const [isError, setIsError] = useState(false);

    let history = useHistory();
    const inputRef = useRef();

    const navToParty = () => {
        // Grab the join code from the input and validate it is 4 digits if it is 4 digits, navigate to the party page if it is not 4 digits, display an error message
        const joinCode = inputRef.current.value;

        if(joinCode.length === 4) {
            // Navigate to the party page
            history.push(`/party/${joinCode}/guest`);
        }
        else {
            // Display an error message
            setIsError(true);
        }
    }

    const changeHandler = (event) => {
        const value = event.target.value;

        inputRef.current.value = value;
    }

  return (
    <div className='content'>
        <NavLink to={'/party'} className="back">
            <img src={back} alt="Back symbol" />
        </NavLink>
        <h2 className='title'>Join Party</h2>
        <div id='join-party-page'>
            <input type="number" min="0" max="9999" placeholder="Join Code" ref={inputRef} onChange={changeHandler} />
            <Button onClick={navToParty}>Join Party</Button>
            { isError && <p>Join code must be 4 digits</p> }
        </div>
    </div>
  )
}

export default JoinParty;