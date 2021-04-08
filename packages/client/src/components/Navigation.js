import React, { useState, useContext, useEffect } from 'react';
import { Context } from './App';
import { Nav } from '@fluentui/react';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
  useAccount,
} from '@azure/msal-react';

import { withRouter, useLocation } from 'react-router-dom';

const Navigation = withRouter(({ history }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [state, dispatch] = useContext(Context);
  const location = useLocation();
  const [expanded, setExpanded] = useState([
    {
      name: 'Knihovna',
      expanded: true,
    },
    {
      name: 'Filmový klub',
      expanded: true,
    },
  ]);

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
      {
        key: 'key7',
        pathName: '/filmovy-klub/virtualni-kinosal',
      },
      {
        key: 'key8',
        pathName: '/filmovy-klub/sprava',
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
          name: 'Knihovna',
          links: [
            {
              name: 'Katalog',
              key: 'key2',
              icon: 'SearchBookmark',
              url: '/knihovna/katalog',
            },
          ],
          isExpanded: expanded.filter((obj) => {
            return obj.name === 'Knihovna';
          })[0].expanded,
        },
        {
          name: 'Filmový klub',
          links: [
            {
              name: 'Virtuální kinosál',
              key: 'key7',
              icon: 'MyMoviesTV',
              url: '/filmovy-klub/virtualni-kinosal',
            },
          ],
          isExpanded: expanded.filter((obj) => {
            return obj.name === 'Filmový klub';
          })[0].expanded,
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

      defaultGroups[0].links[1].links.push({
        name: 'Moje výpůjčky',
        key: 'key3',
        icon: 'DoubleBookmark',
        url: '/knihovna/moje-vypujcky',
      });

      if (state.permissions && state.permissions.includes('SPRAVCE_KNIHOVNY')) {
        defaultGroups[0].links[1].links.push({
          name: 'Správa',
          key: 'key6',
          icon: 'DataManagementSettings',
          url: '/knihovna/sprava',
        });
      }

      if (
        state.permissions &&
        state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
      ) {
        defaultGroups[0].links[2].links.push({
          name: 'Správa',
          key: 'key8',
          icon: 'DataManagementSettings',
          url: '/filmovy-klub/sprava',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const _onLinkClick = (event, element) => {
    event.preventDefault();
    history.push(element.url);
  };

  const _onLinkExpandClick = (event, element) => {
    let expandedGroup = expanded.filter((obj) => {
      return obj.name === element.name;
    })[0];

    expandedGroup.expanded = !expandedGroup.expanded;
    setExpanded([...expanded, expandedGroup]);
  };

  return (
    <>
      <UnauthenticatedTemplate>
        <Nav
          groups={defaultGroups}
          onLinkExpandClick={_onLinkExpandClick}
          selectedKey={getSelectedKey(location)}
          onLinkClick={_onLinkClick}
        />
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <Nav
          groups={defaultGroups}
          onLinkExpandClick={_onLinkExpandClick}
          selectedKey={getSelectedKey(location)}
          onLinkClick={_onLinkClick}
        />
      </AuthenticatedTemplate>
    </>
  );
});

export default Navigation;
