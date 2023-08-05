import React, { useEffect, useState, useContext, useRef }  from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';

import Loading from '../../shared/components/Loading';
import Button from '../../shared/components/FormElements/Button';

import back from '../../shared/assets/img/back.svg';

import './PartyWait.css';

const PartyWait = ({ socket }) => {
    const auth = useContext(AuthContext);
    let history = useHistory();
  
    // Get the party code and user type from the url
    const { code, userType } = useParams();

    const [memberCount, setMemberCount] = useState(0);

    const memberCountRef = useRef(memberCount);

    // Log the collections passed from the previous page using useEffect
    useEffect(() => {
        auth.showFooterHandler(false);
        // Make a fetch request to the backend to get all the collectionItems for the party
        fetch(`https://choice-champ-backend.glitch.me/party/${code}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(body => {
            let memberCount = body.party.memberCount + 1;

            memberCountRef.current = memberCount;
            setMemberCount(memberCountRef.current);

            // Join the party room. This will restrict the same movie getting voted in different parties
            socket.emit('join-room', `waiting${code}`);

            // Emit event to clear the votes for the party
            socket.emit('member-remote-increment', `waiting${code}`);

            // Make a post request to the backend to add the user to the party
            fetch(`https://choice-champ-backend.glitch.me/party/add-member/${code}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    partyCode: code,
                })
            });
        });
    }, []);

    useEffect(() => {
        socket.on('member-increment', () => {
            memberCountRef.current += 1;
            setMemberCount(memberCountRef.current);
        });

        socket.on('member-decrement', () => {
            memberCountRef.current -= 1;
            setMemberCount(memberCountRef.current);
        });

        socket.on('start-party', () => {
            // Emit event to leave the party room
            socket.emit('leave-room', `waiting${code}`);
            history.push({
                pathname: `/party/${code}/guest`,
            });
        });

        socket.on('party-deleted', () => {
            // Redirect to the party page
            history.push('/party');
        });

        return () => {
            socket.off('member-increment');
            socket.off('member-decrement');
            socket.off('start-party');
            socket.off('party-deleted');
        }

    }, [socket]);

    const routeToParty = () => {
        // Emit event to start the party and route others to the party page
        socket.emit('start-remote-party', `waiting${code}`);
        // Emit event to leave the party room
        socket.emit('leave-room', `waiting${code}`);

        // Route to the party page
        history.push({
            pathname: `/party/${code}/owner`,
        });
    }

    const navBack = async () => {
        if(userType === 'owner') {
            // Make a fetch request to the backend to get all the collectionItems for the party
            fetch(`https://choice-champ-backend.glitch.me/party/${code}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                socket.emit('party-remote-deleted', `waiting${code}`);
                // Redirect to the home page
                history.push('/party');
            });
        }
        else {
            socket.emit('leave-room', `waiting${code}`);
            socket.emit('member-remote-decrement', `waiting${code}`);

            // Make a post request to the backend to remove the user from the party
            await fetch(`https://choice-champ-backend.glitch.me/party/remove-member/${code}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    partyCode: code,
                })
            });
            
            history.push('/party');
        }
    }


  return (
    <div className='content'>
        <img src={back} alt="Back symbol" className="top-left" onClick={navBack} />
        <div className='party-wait-code'>
            Party Code: {code}
        </div>
        <img id="waiting-img" src="https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/waiting-screen.svg?v=1691033380153" />
        <Loading type='propagate' className='list-loading' size={15} speed={.25} />
        <div className='party-wait-count'>
            Party Count <span className='party-wait-count-num'>{memberCount}</span>
        </div> 
        { userType === 'owner' &&
            <Button className='party-wait-start-btn' onClick={routeToParty}>
                Start Party
            </Button>
        }
    </div>
  )
}

export default PartyWait;