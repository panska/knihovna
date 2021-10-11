import React, { useState, useEffect, useContext } from 'react';
import { Context } from './App';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
  useAccount,
  useIsAuthenticated,
} from '@azure/msal-react';
import {
  ContextualMenu,
  ContextualMenuItemType,
  Persona,
  PersonaInitialsColor,
  PersonaSize,
} from '@fluentui/react';
import axios from 'axios';
import { loginRequest } from '../config/config';
import styled from 'styled-components';

import { getProfilePicture } from '../utils/getProfilePicture';

const Navbar = styled(({ className }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const isAuthenticated = useIsAuthenticated();
  const [state, dispatch] = useContext(Context);
  const [profilePicture, setProfilePicture] = useState(null);
  const linkRef = React.useRef(null);

  useEffect(() => {
    if (account) {
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: account,
        })
        .then((res) => {
          axios
            .get('/api/user/login', {
              headers: {
                Authorization: res.idToken,
              },
            })
            .then((permissions) => {
              getProfilePicture(res.accessToken).then(
                (profilePictureBase64) => {
                  setProfilePicture(
                    `data:image/jpeg;base64,${profilePictureBase64}`
                  );
                  dispatch({
                    type: 'UPDATE_USER',
                    payload: {
                      permissions: permissions.data,
                      profilePicture: `data:image/jpeg;base64,${profilePictureBase64}`,
                      username: account.name,
                    },
                  });
                }
              );
            });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    let classList = document.getElementsByClassName('ms-Persona')[0].classList;
    for (let className of classList) {
      if (className.startsWith('root')) {
        classList.remove(className);
      }
    }
  });

  const [target, setTarget] = React.useState({ x: 0, y: 0 });
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const onShowContextualMenu = React.useCallback((e) => {
    e.preventDefault();
    setTarget({
      x: document.documentElement.clientWidth,
      y: document.documentElement.scrollTop + 48,
    });
    setShowContextualMenu(true);
    document.getElementsByClassName('menu')[0].classList.add('active');
  }, []);
  const onHideContextualMenu = React.useCallback(() => {
    setShowContextualMenu(false);
    document.getElementsByClassName('menu')[0].classList.remove('active');
  }, []);

  const authenticatedItems = [
    {
      key: 'account',
      text: account && account.name,
      itemType: ContextualMenuItemType.Header,
    },
    {
      key: 'divider_1',
      itemType: ContextualMenuItemType.Divider,
    },
    {
      key: 'logout',
      text: 'Odhlásit se',
      onClick: () => instance.logout(),
    },
  ];

  const UnauthenticatedItems = [
    {
      key: 'login',
      text: 'Přihlásit se',
      onClick: () => instance.loginPopup(loginRequest),
    },
  ];

  return (
    <div className={className}>
      <div className='container'>
        <div className='navbar-logo'>
          <a href='http://panska.cz'>
            <img
              alt='Panská'
              title='Panská'
              src={process.env.PUBLIC_URL + '/logo.svg'}
            ></img>
          </a>
        </div>
        <div className='navbar-heading'>
          <h1>Školní knihovna</h1>
        </div>
        <ul className='menu'>
          <AuthenticatedTemplate>
            <li>
              <Persona
                className=''
                ref={linkRef}
                onClick={onShowContextualMenu}
                imageUrl={profilePicture}
                size={PersonaSize.size32}
                imageAlt='Persona'
              />
            </li>
            <li>
              <ContextualMenu
                items={authenticatedItems}
                hidden={!showContextualMenu}
                target={target}
                onItemClick={onHideContextualMenu}
                onDismiss={onHideContextualMenu}
              />
            </li>
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <li>
              <Persona
                size={PersonaSize.size32}
                onClick={onShowContextualMenu}
                imageInitials='?'
                initialsColor={PersonaInitialsColor.gray}
              />
            </li>
            <li>
              <ContextualMenu
                items={UnauthenticatedItems}
                hidden={!showContextualMenu}
                target={target}
                onItemClick={onHideContextualMenu}
                onDismiss={onHideContextualMenu}
              />
            </li>
          </UnauthenticatedTemplate>
        </ul>
      </div>
    </div>
  );
})`
  height: 48px;
  background-color: black;
  .container {
    display: grid;
    grid-template-columns: auto 1fr auto;
    height: 48px;
  }
  .navbar-heading h1 {
    font-family: Segoe UI Semibold;
    font-size: 16px !important;
    font-weight: 600;
    color: white;
    display: inline-block;
    margin: 12px 0 0 0.75em;
  }
  .navbar-logo img {
    height: 24px;
    margin: 12px 0 0 0.75em;
  }
  ul {
    display: flex;
    justify-self: flex-end;
    justify-content: center;
    align-items: center;
  }
  .menu {
    padding: 0 0.5em 0 0.5em;
  }
  .menu:hover {
    cursor: pointer;
    background-color: #0078d4;
    -webkit-transition: background-color 250ms linear;
    -ms-transition: background-color 250ms linear;
    transition: background-color 250ms linear;
  }
  .menu .active {
    background-color: white;
  }
`;

export default Navbar;
