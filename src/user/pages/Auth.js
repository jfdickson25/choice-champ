import React, {useContext, useState} from 'react';
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import logo from '../../shared/assets/img/logo.png'
import Button from '../../shared/components/FormElements/Button';

import { AuthContext } from '../../shared/context/auth-context';

import './Auth.css';

const Auth = props => {
    // useContext is used to access the context object created in auth-context.js
    // with this we can access the isLoggedIn state and the login and logout functions
    const auth = useContext(AuthContext);
    const history = useHistory();
    // State to change between login and create
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Allow for validation of input
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = data => {
        let status; 

        // Either login or create account
        if(isLoginMode) {
            fetch('http://localhost:5000/user/signIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.usernameRequired,
                    password: data.passwordRequired
                })
            })
            .then(response => {
                status = response.status;
                return response.json()
            })
            .then(body => {
                if(status === 200) {
                    auth.login();
                    // Save user id to context so it can be used in other backend calls
                    auth.userIdSetter(body.userId);
                    history.push('/collections');
                } else {
                    // TODO: Update to display error message on page
                    // TODO: Update backend to return error message
                    console.log('Invalid username or password');
                }
            })
            .catch(err => {
                console.log(err);
            });
        } else {
            fetch('http://localhost:5000/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: data.usernameRequired,
                    password: data.passwordRequired
                })
            })
            .then(response => response.json())
            .then(body => {
                auth.login();
                console.log(body.userId);
                auth.userIdSetter(body.userId);
                history.push('/welcome/info');
            })
            .catch(err => {
                // TODO: Update to display error message on page
                console.log(err);
            });
        }
    }

    const switchModeHandler = () => {
        setIsLoginMode(prevMode => !prevMode);
    }

    return (
        <div className='center'>
            <form onSubmit={handleSubmit(onSubmit)}>
                
                <img src={logo} alt="Movie Match Logo" id="logo" />
                
                <div className='seperator' />
                
                {
                    isLoginMode && (
                        <div>
                            <h3>Welcome Back</h3>
                            <h4>Login back to account</h4>
                        </div>
                    )
                }
                {
                    !isLoginMode && (
                        <div>
                            <h3>Welcome!</h3>
                            <h4>Create account</h4>
                        </div>
                    )
                }
                <input id="username" placeholder="Username" {...register("usernameRequired", { required: true, minLength: 5, maxLength: 20 }) }/>
                {errors.usernameRequired && <p className='error'>A username of at least 5 characters is required</p>}
                <input id="password" placeholder="Password" {...register("passwordRequired", { required: true, minLength: 5 }) }/>
                {errors.passwordRequired && <p className='error'>A password of at lease 5 characters is required</p>}
                {
                    isLoginMode && (
                        <Button type="submit">Login</Button>
                    )
                }
                {
                    !isLoginMode && (
                        <Button type="submit">Create</Button>
                    )
                }
                <div className='switch'>
                    { isLoginMode && (
                        <div>
                            <p>Don't have an account?</p>
                            <p onClick={switchModeHandler} className="switch-link">Create Account</p>
                        </div>
                    )}
                    { !isLoginMode && (
                    <div>
                        <p>Already have an account?</p>
                        <p onClick={switchModeHandler} className="switch-link">Login</p>
                    </div>
                    )}

                </div>
            </form>
        </div>
    );
}

export default Auth;