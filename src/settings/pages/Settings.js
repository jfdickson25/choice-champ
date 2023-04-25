import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import Button from '../../shared/components/FormElements/Button';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import edit from '../../shared/assets/img/edit.png';
import editing from '../../shared/assets/img/editing.png';
import circle from '../../shared/assets/img/circle.png';
import filledCircle from '../../shared/assets/img/filled-circle.png';
import check from '../../shared/assets/img/check.png';
import save from '../../shared/assets/img/save.png';

import './Settings.css';
import { Dialog } from '@mui/material';

const Settings = props => {
    const auth = useContext(AuthContext);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFlaticonModal, setShowFlaticonModal] = useState(false);

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    const openDeleteModal = () => {
        setShowDeleteModal(true);
    }

    const handleClose = () => {
        setShowDeleteModal(false);
    }

    const openFlaticonModal = () => {
        setShowFlaticonModal(true);
    }

    const handleCloseFlaticon = () => {
        setShowFlaticonModal(false);
    }

    const deleteAccount = () => {
        fetch(`https://choice-champ-backend.glitch.me/user/${auth.userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }

        })
        .then(res => {
            auth.logout(); 
        });
    }

    return (
        <React.Fragment>
            <div className="content">
                <div className='settings-home'>
                    <div className='settings-attribution'>
                        <img 
                            src='https://play-lh.googleusercontent.com/XXqfqs9irPSjphsMPcC-c6Q4-FY5cd8klw4IdI2lof_Ie-yXaFirqbNDzK2kJ808WXJk=w240-h480-rw' 
                            className='settings-attribution-logo' 
                        />
                        <p className='settings-attribution-text'>
                            This product uses TMDB API but is not endorsed or certified by TMDB. All movie and TV show data is provided by TMDB.
                        </p>
                        <img 
                            src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAApVBMVEX///8AAABK0pU70I/19fUMDAzO8eDt7e35+fnT09PCwsJISEinp6f8/Pzq+fLa2to+Pj4hISE4ODiXl5exsbGCgoLi4uKcnJzNzc18fHxB0ZGPj480z4zg4OCN4LlfX1+tra1SUlJycnLj9+31/Pmy6s9n2KSm58gxMTG7u7t43K2Hh4clJSVoaGgYGBiY479cXFzF79tS1JqE3rPW9OXH79xv2qi8C8L8AAAGMklEQVR4nO2aaVujPBSGoYvUlhZqFyildlW7Oo468/9/2gtkJQFKN73G97k/OCULcB5OcnKSMQwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgH6dwVsCRt7u463/uSN2W1Dav5hMT0p7AaPv9YFVbvQSWf4IU0itsEwU8V4VeRBJV30ugxaRRss29Rcxyr/XVvfH0KJaj+Ttosq/Rypfev7V7NmLltGI3RIOb0l/Dc/XRyoSHns6oWafBMGj0zSZZaf9/kRHqwHydySLrdX2rL2RRpEBKb/4RMA21CcExdg/qpr0B1fLiCNeexzR8MwSNp8q64hcT6GhqM6Q0aFxtzJsuQ21wNFcjwf2GuEt6pnaWRcIIGm37EzOLXTIPvm1cfmSMEnx2FpJ7PGBlhYUBefrppzkblNSDO4/BrqqR7RaNOZBXk2xjzwer12cBwk5fngaCkBq6igbFQC76cp3xfN0RcrAS/9EryAYfs8lwNjM1hvrNy238FfM57z6hkcbFSyahU5rKzNfh+7tinrj5pdb8L6n6SBsaWf2uRL9LBz2v0uGgwDfilrsEwigG+GvPc9AjKwrrfbJrpFg0nulczu1etOZv1L1todnh8FPkijYtsQgw/1ceuW60WXdwkdDUNGuM6abCwjJ4bNV9H337qtkhpXBDxEC0Pp+uo/97n/Ty67KgvuF3+lAbQ+oDLYHWjbuuDUSPrTPPVu0QELXGiiQIXJ/hQu1imiqrBRqrzd8k/9+lVFakyDKJlk/az5dpD4kRDVy4bteVXmE9Ezf6CiXWlakA9f5sfF2vHNBinKl2mwcMxDd7S1VNFzZiuJWmQkqdeO1+Ep3TaUCWe/8nd4EXrcUwDW6svp8FcqR7qEkTUhAZp3s7XQMRH2fNFod7hyFgYZklQYiz0lNpRtqlungaXhJtP2RHoPgF3juofvUNj3Ot55LG9hHFKgzl9pUVz4sz4t480sHvePvk9oN2GsgbMLLfvOJt4qquJW438idOn07BpyxqMmo4/or/P2L3gSPmjvIGW8DevE3ksvxQaMDegewLj1CUZwVIoExpQS8ak/N704j8EGg5mJn+IlborzTrWF2jQEY5Al4s8WIT61klKg4w1EnVpHu4WugaS03IN2tR5WIUlZOERkTpfk2tg04qR8kXOgJsckBXhik+Ij7l9cjUgVokJqlZOA/rNUxGOjJydWjDgGrBQ4F+ugbYkZKMjyNhFpORqwL8V462UBiSYtORHUPWk1sQR5lwDVq5cnoVIDegCiVxnJgqUPA1qiv+yGeGYBmP2iQVD5RmG0UwK9szoLitvX0EDLUUkoyMrmWQc0UBasPRO0EDye8OYaJaRAfN6Gw3EkohuFSQTYtamAiNPg4bmB4MTNFgYEpbmB2TJ9HAbDbQto2h05J2rEPI0MMiZQ1+0XJfSoM9vwKGW+aKEzP/TG2mgbR0+V8LC87VcDUgmJ2I1nfCJBi3VKq4BdXxpLtVDDHUM70YaSFvILGHI2ECTyNWAfFCzx15vLWswT9UZ8hqpS+7AJhJvyNcDdrpxPM5uo4F2lPCRHxdjcjWgE4I5SNJchyUJRAO6Gy0WikIDanA9cRJrEXs8S852yWMmNE2cGzfTQBwpFUTEEhqIzHk6HohUkWjQZ1W7A3F7oUGbtewuRkmpL6VR092AJ8rO7TQQ8bFgZVRGA+rVCvdSM0IrrQEN/oLYQtfUSAbSrTQo3Eo/RYPM5JmmUAOlSN4/8JQu0dxX26v3IdHzVhqIY6eMI5VTNEgdx5rrhaxBWzJqrmigbr4coqLGPF1Gp9ObaVB0tFZOA/YWbKvTjCObvEZKG2UxZ2cRcShbTJcY/VdR1GIrCyVBuJ4G0rGTupWs43m2bXv8rLRtJ/Dq4Tj+wt1FNLH5SY1ICP1FHCv2b7M4DG6SSrGqnPQSz+geNuJRzVGs1Ou8J8JJI366PeNP99JPvwQeH69xDtxu5J6otxtFD2joHYs7XJVlNfkfWCXc4AfT2YbV8G/u5tH/hHanzOoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAVfgPS6Bfx+gdKGUAAAAASUVORK5CYII=' 
                            className='settings-attribution-logo' 
                            onClick={openFlaticonModal}
                        />
                        <p className='settings-attribution-text'>
                            All icons for this application were used from flaticon. For an exteded list of all icons please press te flaticon icon to the left.
                        </p>
                        <img 
                            src='https://design.freepikcompany.com/media/img/logo/storyset/iso.svg' 
                            className='settings-attribution-logo' 
                        />
                        <p className='settings-attribution-text'>All illustrated imagery was used from Storyset. For an extensive list of all the illustrations used please press the icon to the left.</p>
                        <img 
                            src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAdVBMVEUAAAD////u7u6Ojo7W1taSkpKoqKj7+/va2tr4+Pi7u7uGhoacnJwtLS3z8/Ojo6MVFRVhYWHf398QEBB3d3ckJCRoaGg1NTXIyMh/f3+zs7POzs4cHBwwMDBRUVFXV1dGRkZmZmY7Ozu4uLhKSkpTU1Pn5+fAXMcuAAAEpElEQVR4nO3Ze3eiPBDAYbHesJZaL/VS21rb1+//Ed/CTEJCBvZU3T275/yev5plwAwZksD2egAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAf8Ty9eHm11zdBXYfx2V3+NqHdlxt+Ozbw7LpTx7K4Y157tv+nFUW+/dLMmkzyWLF9qkrfOcDzcNTOXZ27X7VdAl/6KkH48ynRdiL88fFCSUGWWLbEf7io8xBfI7T30hrpM1HaU6ME0fNTnxek1TEyDDrt5bqug56MQP04FFau3hIt9KcpadN004MrsurZmVo3uWwy6Xx2grQor+LOz6XptRs9l9y1t7qRFcp/YRmmPe/5f7q9jwSFmlLjFbbPkopW1WtubaSk578NYvJ5PzLTvyQZjjszefz9bubd9oGMbzHZplqZ89x+Cg8lp7nbkTxXA720d3G/i3yCzKMmpm9LN1Xx6YyY4ytmHUhJVE9yb6mJeHH+Ke8XRRVB/o5+DqNDN/14l8dwav3jirSKqhWNP945a9lUyeaU0sXsk3zIvsrc4su72/sWNrmeiQz6XjT6yjTmRy7L/+uH6lqNAq79h7yJJ/nyaD05zOUIl340bBi9GGbfv+5HvsMywdRJ5pkinTzzE03MoFGhu7nju2xM5eqDFRT7m5Db1X9VZ1UzlzPLbU9zOyxvZVGhvoEFHMjdCNj8r2cPUiUuSjLTFisdeV4kYf24Ov32DxBn9bF7XKKaYaz3uFw2Ozc5nBqhcrI5eWfGmdtMHVIvjRodqjuy5Mr7XNywjaq3uVs5O1v8qJh7mnsqXRQJ68L+50RdXIVLDPIScpi71a99N5to5u6LIJuHH9bho9WpO5Jq/2JPq7mxmCsHa5iCq3ORW8jD2i6xDTGsB/047dlaM/Sd3JQGtKPsfWmt9XkR9pvuRu9Dzk9LbxpdLf+RIb9VVdkf1Yaaj+s2VQnWokvh6yquye5QcaMqTsYPTIPqzTZHFyR4TjP3b67ZU+6NAbbnE11oj35Plaz60yGapTGr+IBW+12u5XeQPtjwGUZlquFTueZPYZ3Vobm/lW2MtVMevZn9mVsjK3mUS8Vvjbq9sdas34syHCuo5hO6KXm5w5hzabB62z1RL8G8daVdXOX1/l8yb/cZokMV3y3p7cGcWMmaJb0qj4sVyo6w/3P1vtcfX8ySvoC0Z5Gf8raQGmRDj6nwr3EGR88Tn4/OpYtwafP0OyzH+MX+Wxw0PUje7t9hu5uGu9FWqSv/h+y8MSYf6fQMnPfp9p21/4zVD69X+2mbsq70ZeaKMODXjt9EjfJgUWURMS/F+rOwV02y61tXq9+yY8dr0rMi3fe7m4m69ww6nIYaqxZ/kF0ZeYW3bZR2dRfiGrmm8sF4gwf9BFKnsRJ3OVvb1l0Zsgvne4fHttjxSkdRWuWvsgk/u293Rf3nTRMQztllalWsJ8c3beR9pfceeOLab/zy/uPbIvyO2LhSuKhLxpP4r1ERRvWaSGhRpnOJNwPw2FRRS66/lPkK8jxfKMPiX+dt+Fovx/NWvbFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDI/xvlKvVeLz38AAAAAElFTkSuQmCC' 
                            className='settings-attribution-logo' 
                        />
                        <p className='settings-attribution-text'>This product uses RAWG API but is not endorsed or certified by RAWG. All game data is provided by RAWG</p>
                    </div>
                    <Button onClick={auth.logout}>Logout</Button>
                    <Button className='btn-delete' onClick={openDeleteModal}>Delete Account</Button>
                </div>
            </div>
            <Dialog open={showDeleteModal} onClose={handleClose} fullWidth maxWidth='lg'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <h2 className='modal-header'>Are you sure you want to delete your account?</h2>
                        <div className='dialog-buttons'>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button className='btn-delete' onClick={deleteAccount}>Delete</Button>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog open={showFlaticonModal} onClose={handleCloseFlaticon} fullWidth maxWidth='lg' scroll='body'>
                <div className='dialog-content'>
                    <div className='dialog-sub-content'>
                        <h2 className='modal-header'>Flaticon Attribution</h2>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/unwatched.png?v=1682136649813' />
                            <a href="https://www.flaticon.com/free-icons/close" title="close icons">Close icons created by Lizel Arina - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/movie.png?v=1682271238203' />
                            <a href="https://www.flaticon.com/free-icons/video-production" title="video production icons">Video production icons created by Uniconlabs - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/tv.png?v=1682271238537' />
                            <a href="https://www.flaticon.com/free-icons/watching-tv" title="watching tv icons">Watching tv icons created by Dmytro Vyshnevskyi - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/game.png?v=1682271237845' />
                            <a href="https://www.flaticon.com/free-icons/gamer" title="gamer icons">Gamer icons created by VectorPortal - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={back} />
                            <a href="https://www.flaticon.com/free-icons/previous" title="previous icons">Previous icons created by Freepik - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={add} />
                            <a href="https://www.flaticon.com/free-icons/read-more" title="read more icons">Read more icons created by Royyan Wijaya - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={edit} />
                            <a href="https://www.flaticon.com/free-icons/edit" title="edit icons">Edit icons created by iconixar - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={editing} />
                            <a href="https://www.flaticon.com/free-icons/edit" title="edit icons">Edit icons created by iconixar - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/watched.png?v=1682136650141' />
                            <a href="https://www.flaticon.com/free-icons/eye" title="eye icons">Eye icons created by torskaya - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/remove.png?v=1682136649433' />
                            <a href="https://www.flaticon.com/free-icons/delete" title="delete icons">Delete icons created by Pixel perfect - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={check} />
                            <a href="https://www.flaticon.com/free-icons/yes" title="yes icons">Yes icons created by juicy_fish - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={filledCircle} />
                            <a href="https://www.flaticon.com/free-icons/circle" title="circle icons">Circle icons created by Freepik - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src={circle} />
                            <a href="https://www.flaticon.com/free-icons/circle" title="circle icons">Circle icons created by Freepik - Flaticon</a>
                        </div>
                        <div className='flaticon-link'>
                            <img src='https://cdn.glitch.global/7cdfb78e-767d-42ef-b9ca-2f58981eb393/save.png?v=1682394809855' />
                            <a href="https://www.flaticon.com/free-icons/ui" title="ui icons">Ui icons created by Yogi Aprelliyanto - Flaticon</a>
                        </div>
                    </div>
                </div>
            </Dialog>
        </React.Fragment>
    );
}

export default Settings;