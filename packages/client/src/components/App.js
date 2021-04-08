import React, { createContext, useReducer } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/config';
import { initializeIcons } from '@uifabric/icons';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Navbar from './Navbar';
import Navigation from './Navigation';
import Index from '../screens/Index';
import {
  Catalog,
  Borrowed,
  Manage,
  Add,
  Remove,
  Borrow,
  Return,
  Book,
  Loans,
  Export,
  Extend,
} from '../screens/library';
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
                  <Catalog />
                </Route>
                <Route path='/knihovna/kniha'>
                  <Book />
                </Route>
                <Route path='/knihovna/moje-vypujcky'>
                  <Borrowed />
                </Route>
                <Route path='/knihovna/sprava/pridat-knihu'>
                  <Add />
                </Route>
                <Route path='/knihovna/sprava/upravit-zaznam-knihy'></Route>
                <Route path='/knihovna/sprava/odstranit-knihu'>
                  <Remove />
                </Route>
                <Route path='/knihovna/sprava/vypujcky'>
                  <Loans />
                </Route>
                <Route path='/knihovna/sprava/vypujcit-knihu'>
                  <Borrow />
                </Route>
                <Route path='/knihovna/sprava/prodlouzit-vypujcku'>
                  <Extend />
                </Route>
                <Route path='/knihovna/sprava/vratit-knihu'>
                  <Return />
                </Route>
                <Route path='/knihovna/sprava/export-databaze'>
                  <Export />
                </Route>
                <Route path='/knihovna/sprava'>
                  <Manage />
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
