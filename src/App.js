import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { socket } from './socket';
import {
  BrowserRouter as Router,
  Route, 
  Redirect,
  Switch 
} from 'react-router-dom';

import Loading from './shared/components/Loading';

import { AuthContext } from './shared/context/auth-context';

const Categories = lazy(() => import('./categories/pages/Categories'));
const Collection = lazy(() => import('./collection/pages/Collection'));
const Search = lazy(() => import('./collection/pages/Search'));
const Collections = lazy(() => import('./collections/pages/Collections'));
const Auth = lazy(() => import('./user/pages/Auth'));
const Welcome = lazy(() => import('./welcome/pages/Welcome'));
const PartyHome = lazy(() => import('./Party/pages/PartyHome'));
const CreateParty = lazy(() => import('./Party/pages/CreateParty'));
const Party = lazy(() => import('./Party/pages/Party'));
const JoinParty = lazy(() => import('./Party/pages/JoinParty'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  let routes;
  // TODO: Add logic back in once we implement authentication
  // if(isLoggedIn) {
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
          <Route path="/collections/:type/:name/:id" exact>
            <Collection />
          </Route>
          <Route path="/collections/:type/:name/:id/add" exact>
            <Search />
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
          <Route path="/party/:code/:userType" exact>
            <Party />
          </Route>


          <Redirect to="/collections" />
        </Switch>
      </Suspense>
    )
  // } else {
  //   routes = (
  //     <Suspense fallback={<Loading />}>
  //       <Switch>
  //           <Route path="/" exact>
  //             <Auth />
  //           </Route>
  //           <Redirect to="/" />
  //       </Switch>
  //     </Suspense>
  //   )
  // }


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
