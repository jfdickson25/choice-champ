import React, { lazy, Suspense, useCallback, useState } from 'react';
import {
  BrowserRouter as Router,
  Route, 
  Redirect,
  Switch 
} from 'react-router-dom';

import Loading from './shared/components/Loading';

import { AuthContext } from './shared/context/auth-context';

const Categories = lazy(() => import('./categories/pages/Categories'));
const MovieCollection = lazy(() => import('./collection/pages/MovieCollection'));
const Collections = lazy(() => import('./collections/pages/Collections'));
const Auth = lazy(() => import('./user/pages/Auth'));
const Welcome = lazy(() => import('./welcome/pages/Welcome'));
const PartyHome = lazy(() => import('./Party/pages/PartyHome'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  let routes;

  if(isLoggedIn) {
    routes = (
      // Using Suspense inside a switch caused issues with redirecting. Solution found in this stack overflow article:
      // https://stackoverflow.com/questions/62193855/react-lazy-loaded-route-makes-redirecting-non-matching-routes-to-404-not-work
      <Suspense fallback={<Loading />}>
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
          <Route path="/collections/movies/:name/:id" exact>
            <MovieCollection />
          </Route>

          <Route path="/party" exact>
            <PartyHome />
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
            <Redirect to="/" />
        </Switch>
      </Suspense>
    )
  }


  return (
    <AuthContext.Provider value={{isLoggedIn: isLoggedIn, login: login, logout: logout}}>
      <Router>
        <main>
          {routes}
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
