import { Dialog } from '@mui/material';
import React from 'react';

import './ModalComp.css';

const ModalComp = props => {
    return (
        <Dialog open={props.open} onClose={props.handleClose} fullWidth maxWidth='lg'>
            <div className='dialog-content'>
                <div className='dialog-sub-content'>
                    <input type="text" placeholder={props.placeholder} onChange={props.changeHandler} ref={props.inputRef}/>
                    <button onClick={props.handleInput}>{props.buttonText}</button>
                    { props.searchedMovies ? (
                        <div className='search-results'>
                            { 
                                props.searchedMovies.map(searchedMovie => (
                                    <div 
                                        className='search-result' 
                                        key={searchedMovie.id}
                                        onClick={() => { props.handleMovieAdd(searchedMovie) } } 
                                        style={
                                            {
                                                backgroundImage: `url(https://image.tmdb.org/t/p/w500${searchedMovie.poster})`, 
                                                backgroundRepeat: 'no-repeat', 
                                                backgroundSize: 'cover'
                                            }
                                        }
                                    >
                                        <p>{searchedMovie.title}</p>
                                    </div>
                                ))
                            }
                        </div>
                    ) : null }
                </div>
            </div>
        </Dialog>
    );
}

export default ModalComp;