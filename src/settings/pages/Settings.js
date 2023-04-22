import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../shared/context/auth-context';
import Button from '../../shared/components/FormElements/Button';

import './Settings.css';

const Settings = props => {
    const auth = useContext(AuthContext);

    useEffect(() => {
        auth.showFooterHandler(true);
    }, []);

    return (
        <React.Fragment>
            <div className="content">
                <div className='settings-home'>
                    <Button onClick={auth.logout}>Logout</Button>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Settings;