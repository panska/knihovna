import React, { createContext, useReducer } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/config';
import { initializeIcons } from '@uifabric/icons';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Navbar from './Navbar';
import Navigation from './Navigation';

import knihovna from '../pages/knihovna';
import filmovyKlub from '../pages/filmovy-klub';
import Index from '../pages';
import Admin from '../pages/admin';
import _404 from '../pages/404';

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
                <Route path='/knihovna/kniha'>
                  <knihovna.Kniha />
                </Route>
                <Route path='/knihovna/katalog'>
                  <knihovna.Katalog />
                </Route>
                <Route path='/knihovna/moje-vypujcky'>
                  <knihovna.MojeVypujcky />
                </Route>
                <Route path='/knihovna/sprava/pridat-knihu'>
                  <knihovna.sprava.PridatKnihu />
                </Route>
                <Route path='/knihovna/sprava/upravit-zaznam-knihy'>
                  <knihovna.sprava.UpravitZaznamKnihy />
                </Route>
                <Route path='/knihovna/sprava/odstranit-knihu'>
                  <knihovna.sprava.OdstranitKnihu />
                </Route>
                <Route path='/knihovna/sprava/vypujcit-knihu'>
                  <knihovna.sprava.VypujcitKnihu />
                </Route>
                <Route path='/knihovna/sprava/prodlouzit-vypujcku'>
                  <knihovna.sprava.ProdlouzitVypujcku />
                </Route>
                <Route path='/knihovna/sprava/vratit-knihu'>
                  <knihovna.sprava.VratitKnihu />
                </Route>
                <Route path='/knihovna/sprava/vypujcky'>
                  <knihovna.sprava.Vypujcky />
                </Route>
                <Route path='/knihovna/sprava/export-databaze'>
                  <knihovna.sprava.ExportDatabaze />
                </Route>
                <Route path='/knihovna/sprava'>
                  <knihovna.Sprava />
                </Route>
                <Route path='/filmovy-klub/virtualni-kinosal'>
                  <filmovyKlub.VirtualniKinosal />
                </Route>
                <Route path='/filmovy-klub/sprava/naplanovat-projekci'>
                  <filmovyKlub.sprava.NaplanovatProjekci />
                </Route>
                <Route path='/filmovy-klub/sprava/upravit-naplanovanou-projekci'>
                  <filmovyKlub.sprava.UpravitNaplanovanouProjekci />
                </Route>
                <Route path='/filmovy-klub/sprava/zrusit-naplanovanou-projekci'>
                  <filmovyKlub.sprava.ZrusitNaplanovanouProjekci />
                </Route>
                <Route path='/filmovy-klub/sprava/projekce'>
                  <filmovyKlub.sprava.Projekce />
                </Route>
                <Route path='/filmovy-klub/sprava'>
                  <filmovyKlub.Sprava />
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
