import React, { useState, useContext, useEffect } from 'react';
import { Context } from './App';
import { Nav } from '@fluentui/react';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
  useAccount,
} from '@azure/msal-react';
import styled from 'styled-components';
import { withRouter, useLocation } from 'react-router-dom';

const Navigation = styled(
  withRouter(({ className, history }) => {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [state, dispatch] = useContext(Context);
    const location = useLocation();

    const getSelectedKey = (location) => {
      let links = [
        {
          key: 'key1',
          pathName: '/',
        },
        {
          key: 'key2',
          pathName: '/knihovna/katalog',
        },
        {
          key: 'key3',
          pathName: '/knihovna/moje-vypujcky',
        },
        {
          key: 'key6',
          pathName: '/knihovna/sprava',
        },
        {
          key: 'key5',
          pathName: '/administrace',
        },
      ];

      let link = links.filter((obj) => {
        return obj.pathName === location.pathname;
      });
      return link.key;
    };

    const [defaultGroups, setDefaultGroups] = useState([
      {
        links: [
          {
            name: 'Úvod',
            key: 'key1',
            icon: 'Home',
            url: '/',
          },
          {
            name: 'Katalog',
            key: 'key2',
            icon: 'SearchBookmark',
            url: '/knihovna/katalog',
          },
        ],
      },
    ]);

    useEffect(() => {
      if (account) {
        if (state.permissions && state.permissions.includes('ADMIN')) {
          defaultGroups[0].links.push({
            name: 'Administrace',
            key: 'key5',
            icon: 'AccountManagement',
            url: '/administrace',
          });
        }

        defaultGroups[0].links.push({
          name: 'Moje výpůjčky',
          key: 'key3',
          icon: 'DoubleBookmark',
          url: '/knihovna/moje-vypujcky',
        });

        if (
          state.permissions &&
          state.permissions.includes('SPRAVCE_KNIHOVNY')
        ) {
          defaultGroups[0].links.push({
            name: 'Správa',
            key: 'key6',
            icon: 'DataManagementSettings',
            url: '/knihovna/sprava',
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    const _onLinkClick = (event, element) => {
      event.preventDefault();
      history.push(element.url);
    };

    return (
      <div className={className}>
        <UnauthenticatedTemplate>
          <Nav
            groups={defaultGroups}
            selectedKey={getSelectedKey(location)}
            onLinkClick={_onLinkClick}
          />
        </UnauthenticatedTemplate>
        <AuthenticatedTemplate>
          <Nav
            groups={defaultGroups}
            selectedKey={getSelectedKey(location)}
            onLinkClick={_onLinkClick}
          />
        </AuthenticatedTemplate>
      </div>
    );
  })
)`
  .is-selected a {
    background-color: rgb(220, 236, 249) !important;
    color: #0078d4 !important;
  }
  div[name='Úvod'] a,
  div[name='Administrace'] a,
  div[name='Katalog'] a,
  div[name='Moje výpůjčky'] a,
  div[name='Správa'] a {
    padding: 0 0 0 0.5em;
  }
`;

export default Navigation;
