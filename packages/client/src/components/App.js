import React, { createContext, useReducer } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/config';
import { initializeIcons } from '@uifabric/icons';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Navbar from './Navbar';
import Navigation from './Navigation';
import Index from '../screens/Index';
import Library from '../screens/library';
import Cinema from '../screens/cinema';
import Admin from '../screens/Admin';
import _404 from '../screens/404';

const Context = createContext({ permissions: [] });

const App = () => {
  initializeIcons();
  const msalInstance = new PublicClientApplication(msalConfig);

  const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_USER': {
        return {
          ...state,
          permissions: action.payload.permissions,
          profilePicture: action.payload.profilePicture,
          username: action.payload.username,
        };
      }
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, {
    permissions: [],
    profilePicture: undefined,
  });

  return (
    <MsalProvider instance={msalInstance}>
      <Context.Provider value={[state, dispatch]}>
        <Navbar />
        <div className='body'>
          <Router>
            <div className='navigation'>
              <Navigation />
            </div>
            <div className='router'>
              <Switch>
                <Route path='/knihovna/katalog'>
                  <Library.Catalog />
                </Route>
                <Route path='/knihovna/kniha'>
                  <Library.Book />
                </Route>
                <Route path='/knihovna/moje-vypujcky'>
                  <Library.Borrowed />
                </Route>
                <Route path='/knihovna/sprava/pridat-knihu'>
                  <Library.Add />
                </Route>
                <Route path='/knihovna/sprava/upravit-zaznam-knihy'></Route>
                <Route path='/knihovna/sprava/odstranit-knihu'>
                  <Library.Remove />
                </Route>
                <Route path='/knihovna/sprava/vypujcky'>
                  <Library.Loans />
                </Route>
                <Route path='/knihovna/sprava/vypujcit-knihu'>
                  <Library.Borrow />
                </Route>
                <Route path='/knihovna/sprava/prodlouzit-vypujcku'>
                  <Library.Extend />
                </Route>
                <Route path='/knihovna/sprava/vratit-knihu'>
                  <Library.Return />
                </Route>
                <Route path='/knihovna/sprava/export-databaze'>
                  <Library.Export />
                </Route>
                <Route path='/knihovna/sprava'>
                  <Library.Manage />
                </Route>
                <Route path='/filmovy-klub/virtualni-kinosal'>
                  <Cinema.VirtualHall />
                </Route>
                <Route path='/filmovy-klub/sprava/naplanovat-projekci'>
                  <Cinema.Schedule />
                </Route>
                <Route path='/filmovy-klub/sprava/projekce'>
                  <Cinema.Scheduled />
                </Route>
                <Route path='/filmovy-klub/sprava'>
                  <Cinema.Manage />
                </Route>
                <Route path='/administrace'>
                  <Admin />
                </Route>
                <Route exact path='/'>
                  <Index />
                </Route>
                <Route path='*'>
                  <_404 />
                </Route>
              </Switch>
            </div>
          </Router>
        </div>
      </Context.Provider>
    </MsalProvider>
  );
};

export { Context, App };
