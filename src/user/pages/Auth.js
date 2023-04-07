import React, {useContext, useState} from 'react';
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import logo from '../../shared/assets/img/logo.png'
import Button from '../../shared/components/FormElements/Button';

import { AuthContext } from '../../shared/context/auth-context';

const Auth = props => {
    const auth = useContext(AuthContext);
    const history = useHistory();
    // State to change between login and create
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Allow for validation of input
    const { register, handleSubmit, formState: { errors } } = useForm();

    // TODO: Add context to validate which pages are valid after login
    const onSubmit = data => {
        console.log(data);
        auth.login();
        if(isLoginMode) {
            history.push('/collections');
        } else {
            history.push('/welcome/info');
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
                <input id="username" placeholder="Username" {...register("usernameRequired", { required: true, minLength: 5, maxLength: 15 }) }/>
                {errors.usernameRequired && <p className='error'>A username is of at least 5 characters is required</p>}
                <input id="password" placeholder="Password" {...register("passwordRequired", { required: true, minLength: 5 }) }/>
                {errors.passwordRequired && <p className='error'>A password is required</p>}
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