import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route, 
  Redirect,
  Switch
} from 'react-router-dom';

import io from 'socket.io-client';

import Loading from './shared/components/Loading';
import Footer from './shared/components/Navigation/Footer';

import { AuthContext } from './shared/context/auth-context';

// Lazy loading is a way to load a component only when it is needed. 
// This is useful for components that are not needed right away, but are needed later on. 
// This can help with performance by only loading what is needed at the time.
const Categories = lazy(() => import('./categories/pages/Categories'));
const Collection = lazy(() => import('./collection/pages/Collection'));
const Search = lazy(() => import('./collection/pages/Search'));
const Collections = lazy(() => import('./collections/pages/Collections'));
const Auth = lazy(() => import('./user/pages/Auth'));
const Welcome = lazy(() => import('./welcome/pages/Welcome'));
const PartyHome = lazy(() => import('./Party/pages/PartyHome'));
const CreateParty = lazy(() => import('./Party/pages/CreateParty'));
const PartyWait = lazy(() => import('./Party/pages/PartyWait'));
const Party = lazy(() => import('./Party/pages/Party'));
const JoinParty = lazy(() => import('./Party/pages/JoinParty'));
const Settings = lazy(() => import('./settings/pages/Settings'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);

  const [loading, setLoading] = useState(true);

  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if(storedUserId) {
      // Check if user exists in database
      fetch('https://choice-champ-backend.glitch.me/user/checkUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: storedUserId
        })
      })
      .then(response => {
        return response.json();
      })
      .then(body => {
        if(body.userExists) {
          setUserId(storedUserId);
          setIsLoggedIn(true);
          setLoading(false);
        }
      })
      .catch(err => {
        console.log(err);
        localStorage.removeItem('userId');
        setLoading(false);
      });
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const newSocket = io('https://choice-champ-backend.glitch.me');
    setSocket(newSocket);

    return () => newSocket.close();
  }, [setSocket]);

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem('userId');
  }, []);

  const userIdSetter = useCallback((id) => {
    setUserId(id);
  }, []);

  const showFooterHandler = useCallback((show) => {
    setShowFooter(show);
  }, []);

  let routes;
  if(isLoggedIn) {
    routes = (
      // Using Suspense inside a switch caused issues with redirecting. Solution found in this stack overflow article:
      // https://stackoverflow.com/questions/62193855/react-lazy-loaded-route-makes-redirecting-non-matching-routes-to-404-not-work
      <Suspense fallback={<Loading className='page-loading' size={100} />}>
        <Switch>
          <Route path="/welcome/info" exact>
            <Welcome />
          </Route>

          <Route path="/collections" exact>
            <Categories />
          </Route>
          <Route path="/collections/:type" exact>
            <Collections />
          </Route>
          <Route path="/collections/:type/:name/:id" exact>
            <Collection socket={socket} />
          </Route>
          <Route path="/collections/:type/:name/:id/add" exact>
            <Search socket={socket} />
          </Route>

          <Route path="/party" exact>
            <PartyHome />
          </Route>
          <Route path="/party/createParty" exact>
            <CreateParty />
          </Route>
          <Route path="/party/joinParty" exact>
            <JoinParty />
          </Route>
          <Route path="/party/wait/:code/:userType" exact>
            <PartyWait socket={socket} />
          </Route>
          <Route path="/party/:code/:userType" exact>
            <Party socket={socket} />
          </Route>
          <Route path="/settings" exact>
            <Settings />
          </Route>


          <Redirect to="/collections" />
        </Switch>
      </Suspense>
    )
  } else {
    routes = (
      <Suspense fallback={<Loading />}>
        <Switch>
            <Route path="/" exact>
              <Auth />
            </Route>
            <Route path="/party/joinParty" exact>
              <JoinParty />
            </Route>
            <Route path="/party/wait/:code/:userType" exact>
              <PartyWait socket={socket} />
            </Route>
            <Route path="/party/:code/:userType" exact>
              <Party socket={socket} />
            </Route>
            <Redirect to="/" />
        </Switch>
      </Suspense>
    )
  }

  let footer;

  if(showFooter && isLoggedIn) {
    footer = <Footer />
  }


  return (
    <AuthContext.Provider value={{isLoggedIn: isLoggedIn, userId: userId, userIdSetter: userIdSetter, login: login, logout: logout, showFooterHandler: showFooterHandler}}>
      <Router>
        <main>
          {loading && <Loading className='page-loading' size={100} />}
          {!loading && routes}
          {!loading && footer}
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
