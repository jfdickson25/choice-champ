import React, { useRef, useState, useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import { AuthContext } from '../../shared/context/auth-context';

import back from '../../shared/assets/img/back.svg';

import './JoinParty.css';

// TODO: Add validation that the party exists otherwise display an error message

const JoinParty = (props) => {
    const auth = useContext(AuthContext);

    const [isError, setIsError] = useState(false);

    let history = useHistory();
    const inputRef = useRef();

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

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

    const navBack = () => {
        history.push('/party');
    }

  return (
    <div className='content'>
        <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
        <h2 className='title'>Join Party</h2>
        <img src="https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/join-code.svg?v=1681658134032" className="join-img" alt='Join Code Image'/>
        <div id='join-party-page'>
            <input type="number" min="0" max="9999" placeholder="Join Code" ref={inputRef} onChange={changeHandler} />
            <Button onClick={navToParty}>Join Party</Button>
            { isError && <p>Join code must be 4 digits</p> }
        </div>
    </div>
  )
}

export default JoinParty;