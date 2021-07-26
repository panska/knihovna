import React, { createContext, useReducer } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from '../config/config';
import { initializeIcons } from '@uifabric/icons';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';

import Navbar from './Navbar';
import Navigation from './Navigation';

import knihovna from '../pages/knihovna';
import filmovyKlub from '../pages/filmovy-klub';
import Index from '../pages';
import Admin from '../pages/admin';
import _404 from '../pages/404';

const Context = createContext({ permissions: [] });

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
  }
  .heading {
    margin-top: 1em;
    margin-bottom: 1em;
    margin-left: 2em;
  }
  form {
    width: 397.25px !important;
    margin-bottom: 1.5em;
  }
  .ms-Label::after {
    display: inline-block;
    padding-left: 1.5px;
  }
  .submit {
    margin-top: 1em;
    width: 100% !important;
  }
  .list {
    width: 480px;
    scrollbar-color: transparent transparent;
  }
  .list::-webkit-scrollbar {
    display: none;
  }
  .list::-moz-scrollbar {
    display: none;
  }
  .ms-Callout.ms-ContextualMenu-Callout {
    right: 0px !important;
  }
  .ms-DetailsList {
  overflow-x: hidden;
  }
  .manage .heading,
  .manage.form.container {
    margin-bottom: 0.25em;
  }
  .manage.form.container {
    margin-left: 2em;
  }
  .manage .nav {
    margin-left: 4em;
  }
  .manage.form.heading {
    margin-top: 0;
    margin-bottom: 0;
  }
  .breadcrumb {
    margin-left: 1.5em;
  }
  .breadcrumb .ms-Breadcrumb-itemLink,
  .breadcrumb .ms-Breadcrumb-item {
    font-size: 14px !important;
    font-weight: 400;
  }
  .breadcrumb .ms-Link:hover {
    background-color: transparent !important;
  }
  .manage.form .graduationReadingInput {
    margin-top: 0.75em;
  }
  table {
    margin-top: 0.25em;
    border: 0;
  }
  table,
  th,
  td {
    border: 0;
  }
  th {
    opacity: 0.75;
    font-weight: 400;
  }
  td {
    padding-left: 2em;
  }
  th,
  td {
    padding: 0.25em;
  }
  th {
    text-align: left;
  }
`;

const App = styled(({ className }) => {
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
        <GlobalStyle />
        <Navbar />
        <div className={className}>
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
})`
  display: grid;
  grid-template-columns: 240px auto;
  .navigation {
    width: 240px !important;
    height: calc(100vh - 48px);
    background-color: rgb(237, 235, 233) !important;
    grid-template-columns: repeat(2, fr);
  }
  .router {
    height: calc(100vh - 48px);
    overflow-y: scroll;
  }
`;

export { Context, App };
