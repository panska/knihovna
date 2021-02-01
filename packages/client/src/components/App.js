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
  Loans,
  Manage,
  Add,
  Remove,
  Borrow,
  Return,
} from '../screens/library';
import Admin from '../screens/Admin';

const Context = createContext({ permissions: [] });

function App() {
  initializeIcons();
  const msalInstance = new PublicClientApplication(msalConfig);

  const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_PERMISSIONS': {
        return {
          ...state,
          permissions: action.payload.permissions,
        };
      }
      default:
        return state;
    }
  };
  const [state, dispatch] = useReducer(reducer, {
    permissions: [],
  });

  return (
    <MsalProvider instance={msalInstance}>
      <Context.Provider value={[state, dispatch]}>
        <Navbar />
        <div className='body'>
          <Router>
            <div className='navigation'>
              <Navigation />
              <div className='credits'>
                <p>Kovačević Marko © 2021</p>
                <a href='https://github.com/kvcvc'>gtihub.com/kvcvc</a>
              </div>
            </div>
            <div className='router'>
              <Switch>
                <Route path='/knihovna/katalog'>
                  <Catalog />
                </Route>
                <Route path='/knihovna/moje-vypujcky'>
                  <Loans />
                </Route>
                <Route path='/knihovna/sprava/pridat-knihu'>
                  <Add />
                </Route>
                <Route path='/knihovna/sprava/upravit-zaznam-knihy'></Route>
                <Route path='/knihovna/sprava/odstranit-knihu'>
                  <Remove />
                </Route>
                <Route path='/knihovna/sprava/vypujcky'></Route>
                <Route path='/knihovna/sprava/vypujcit-knihu'>
                  <Borrow />
                </Route>
                <Route path='/knihovna/sprava/prodlouzit-vypujcku'></Route>
                <Route path='/knihovna/sprava/vratit-knihu'>
                  <Return />
                </Route>
                <Route path='/knihovna/sprava'>
                  <Manage />
                </Route>
                <Route path='/administrace'>
                  <Admin />
                </Route>
                <Route path='/'>
                  <Index />
                </Route>
              </Switch>
            </div>
          </Router>
        </div>
      </Context.Provider>
    </MsalProvider>
  );
}

export { Context, App };
