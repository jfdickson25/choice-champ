import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../shared/components/Navigation/Footer';

import back from '../../shared/assets/img/back.svg';
import add from '../../shared/assets/img/add.png';
import remove from '../../shared/assets/img/remove.png';
import edit from '../../shared/assets/img/edit.png';

import './MovieCollection.css';
import ModalComp from '../../shared/components/ModalComp';
import LazyLoad from 'react-lazyload';

const MovieCollection = props => {
    /************************************************************
     * Initial load and data needed. Here we grab the info we need
     * from the params and set edit and our movies list
     ***********************************************************/
    // Grab the collection name and id from the parameters
    let collectionName = useParams().name;
    let collectionId = useParams().id;

    const [movies, setMovies] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        // TODO: This will be replaced by searching the collection from the backend
        fetch(`https://api.themoviedb.org/3/search/movie?api_key=c12d4979283eb8eb2b9dd58aa91c99e2&query=batman`)
        .then(response => response.json())
        .then(res => {
            res.results.forEach(movie => {
                setMovies(prevState => [...prevState, {
                    id: movie.id,
                    title: movie.title,
                    poster: movie.poster_path
                }]);
            });
        });
    }, []);

    /************************************************************
     * Logic for the controlling and updating the dialog/modal
     ***********************************************************/
    // State for modal and array of movies returned in search
    const [open, setOpen] = useState(false);
    const [searchedMovies, setSearchedMovies] = useState([]);

    // Input ref grab value from input when search movie is clicked
    const inputRef = useRef();

    // Functions for handling change to input, and open and close modal
    const changeHandler = (event) => {
        const value = event.target.value;
        inputRef.current.value = value;
    }
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        // Reset the value in the input
        inputRef.current.value = '';
        // Close the modal
        setOpen(false);
        // Set searched movies to an empty array
        setSearchedMovies([]);
    }

    // Search for a list of titles using the title from the input
    const handleMovieSearch = () => {
        let movieTitle = inputRef.current.value;

        fetch(`https://api.themoviedb.org/3/search/movie?api_key=c12d4979283eb8eb2b9dd58aa91c99e2&query=${movieTitle}`)
        .then(response => response.json())
        .then(res => {
            res.results.forEach(movie => {
                setSearchedMovies(prevState => [...prevState, {
                    id: movie.id,
                    title: movie.title,
                    poster: movie.poster_path
                }]);
            });
        });
    }

    // Add the movie to the movie collection list and close the modal
    const handleMovieAdd = (movie) => {
        setMovies(prevState => [...prevState, {
            id: movie.id,
            title: movie.title,
            poster: movie.poster
        }]);

        // TODO: Add call to backend to add movie to collection array

        // This will not only handle closing the modal but also delete
        // the search movie query and remove the searched movie array
        handleClose();
    }

    /************************************************************
     * Logic for setting edit state and removing movies
     ***********************************************************/
    const isEditHandler = () => isEdit ? setIsEdit(false) : setIsEdit(true);

    const removeMovie = (id) => {
        setMovies(movies.filter(item => item.id !== id));

        // TODO: Add backend call to remove from collection
    }

    /************************************************************
     * Logic for creating a query from the search bar. I received
     * help and direction from this youtube video
     * https://youtu.be/E1cklb4aeXA
     ***********************************************************/
    const [query, setQuery] = useState('');

    const filteredMovies = useMemo(() => {
        return movies.filter(movie => {
            return movie.title.toLowerCase().includes(query.toLowerCase());
        })
    }, [movies, query]);

    return (
        <React.Fragment>
            <div className='content'>
                <Link to="/collections/movies" className="back">
                    <img src={back} alt="Back symbol" />
                </Link>
                <h2 className='title'>{collectionName}</h2>
                <img src={edit} className="edit" alt='Edit icon' onClick={isEditHandler} />
                <input className='movies-search' placeholder='Filter Collection' value={query} onChange={e => setQuery(e.target.value)}/>
                <img src={add} className='add' alt='Add icon' onClick={handleOpen} />
                <div className='movies-content'>
                    { /* 
                        Received help from this article: https://bobbyhadz.com/blog/react-map-array-reverse 
                        We use the spread operator here because we want to make a copy of filteredMovies. We don't want
                        to modify it
                    */ 
                    }
                    {[...filteredMovies].reverse().map(movie => (
                        // Lazy load content so it doesn't load automatically potentially causing performance issues
                        // TODO: I've run into the issue of not having key properties on LazyLoad
                        <LazyLoad height={200} offset={100}>
                            <div className='movie-section' key={movie.id} >
                                <div className='movie-img' style={{backgroundImage: `url(https://image.tmdb.org/t/p/w500${movie.poster})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}><p>{movie.title}</p></div>
                                { isEdit ? (<img src={remove} alt={`${movie.title} poster`} className='remove' onClick={() => { removeMovie(movie.id) }} />) : null }
                            </div>
                        </LazyLoad>
                    ))}
                </div>
            </div>
            <ModalComp 
                open={open} 
                handleClose={handleClose} 
                placeholder="Movie title" 
                changeHandler={changeHandler} 
                inputRef={inputRef} 
                handleInput={handleMovieSearch}
                buttonText="Search Movie"
                searchedMovies={searchedMovies}
                handleMovieAdd={handleMovieAdd}
            />
            <Footer />
        </React.Fragment>
    );
}

export default MovieCollection;