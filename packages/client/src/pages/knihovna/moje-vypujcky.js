import React, { useEffect, useState } from 'react';
import {
  List,
  Image,
  ImageFit,
  FocusZone,
  FocusZoneDirection,
  mergeStyleSets,
  getFocusStyle,
  getTheme,
  Link,
} from '@fluentui/react';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
  useAccount,
  useIsAuthenticated,
} from '@azure/msal-react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { resolveDefaultCover } from '../../utils/resolveDefaultCover';
import Title from '../../components/Title';

const MojeVypujcky = styled(({ className }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const isAuthenticated = useIsAuthenticated();
  const [items, setItems] = useState({ current: [], past: [] });

  useEffect(() => {
    axios
      .get(`/api/user/${account && account.localAccountId}/loans`)
      .then((res) => {
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        let current = [
          res.data
            .filter((bookLoan) => {
              return bookLoan.returned !== true;
            })
            .map((bookLoan) => {
              return {
                id: bookLoan.Book.id,
                isbn: bookLoan.Book.isbn,
                name: bookLoan.Book.name,
                authorFamilyName: bookLoan.Book.authorFamilyName,
                authorGivenName: bookLoan.Book.authorGivenName,
                coverUrl: bookLoan.Book.coverUrl,
                genre: bookLoan.Book.genre,
                annotation: bookLoan.Book.annotation,
                publicationYear: bookLoan.Book.publicationYear,
                publisher: bookLoan.Book.publisher,
                origin: bookLoan.Book.origin,
                graduationReading: bookLoan.Book.graduationReading,
                info: `vrátit do ${new Date(
                  bookLoan.returnDate
                ).toLocaleDateString('cs-CZ')}`,
                lateReturn: new Date(bookLoan.returnDate) < currentDate,
              };
            }),
        ];
        let past = [
          res.data
            .filter((bookLoan) => {
              return bookLoan.returned === true;
            })
            .map((bookLoan) => {
              return {
                id: bookLoan.Book.id,
                isbn: bookLoan.Book.isbn,
                name: bookLoan.Book.name,
                authorFamilyName: bookLoan.Book.authorFamilyName,
                authorGivenName: bookLoan.Book.authorGivenName,
                coverUrl: bookLoan.Book.coverUrl,
                genre: bookLoan.Book.genre,
                annotation: bookLoan.Book.annotation,
                publicationYear: bookLoan.Book.publicationYear,
                publisher: bookLoan.Book.publisher,
                origin: bookLoan.Book.origin,
                graduationReading: bookLoan.Book.graduationReading,
                info: `vypůjčeno ${new Date(
                  bookLoan.borrowDate
                ).toLocaleDateString('cs-CZ')}`,
                lateReturn: false,
              };
            }),
        ];
        setItems({
          current: current[0],
          past: past[0],
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const onRenderCell = (item, index, isScrolling) => {
    return (
      <div
        className={classNames.itemCell}
        data-is-focusable={true}
        key={item.id}
      >
        <Image
          className={classNames.itemImage}
          src={item.coverUrl ? item.coverUrl : resolveDefaultCover()}
          width={42.5}
          height={60}
          imageFit={ImageFit.coverUrl}
        />
        <div className={classNames.itemContent}>
          <div className={classNames.itemName}>
            <Link
              as={RouterLink}
              to={{
                pathname: '/knihovna/kniha',
                state: {
                  source: {
                    text: 'Moje výpůjčky',
                    pathname: '/knihovna/moje-vypujcky',
                  },
                  ...item,
                },
              }}
            >
              {item.name}
            </Link>
          </div>
          <div
            className={classNames.itemIndex}
            style={{
              color: item.lateReturn && '#d13438',
              fontWeight: item.lateReturn && 700,
            }}
          >
            {item.info}
          </div>
        </div>
      </div>
    );
  };

  const theme = getTheme();
  const { palette, semanticColors, fonts } = theme;
  const classNames = mergeStyleSets({
    container: {
      overflow: 'auto',
      maxHeight: 500,
    },
    itemCell: [
      getFocusStyle(theme, { inset: -1 }),
      {
        minHeight: 54,
        padding: 10,
        boxSizing: 'border-box',
        borderBottom: `1px solid ${semanticColors.bodyDivider}`,
        display: 'flex',
        selectors: {
          '&:hover': { background: palette.neutralLight },
        },
      },
    ],
    itemImage: {
      flexShrink: 0,
    },
    itemContent: {
      marginLeft: 10,
      overflow: 'hidden',
      flexGrow: 1,
    },
    itemName: [
      fonts.xLarge,
      {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    ],
    itemIndex: {
      fontSize: fonts.small.fontSize,
      color: palette.neutralTertiary,
      marginBottom: 10,
    },
    chevron: {
      alignSelf: 'center',
      marginLeft: 10,
      color: palette.neutralTertiary,
      fontSize: fonts.large.fontSize,
      flexShrink: 0,
    },
  });

  return (
    <div className={className}>
      <Title text='Moje výpůjčky' />
      <AuthenticatedTemplate>
        <div className='heading'>
          <h1>Právě půjčeno</h1>
          {items.current.length <= 0 && <p>Nemáte žádné aktivní výpůjčky.</p>}
        </div>
        {items.current.length > 0 && (
          <div className='list'>
            <FocusZone direction={FocusZoneDirection.vertical}>
              <div className={classNames.container} data-is-scrollable>
                <List items={items.current} onRenderCell={onRenderCell} />
              </div>
            </FocusZone>
          </div>
        )}
        <div className='heading'>
          <h1>Historie výpůjček</h1>
          {items.past.length <= 0 && <p>Nemáte žádné výpůjčky.</p>}
        </div>
        {items.past.length > 0 && (
          <div className='list'>
            <FocusZone direction={FocusZoneDirection.vertical}>
              <div className={classNames.container} data-is-scrollable>
                <List items={items.past} onRenderCell={onRenderCell} />
              </div>
            </FocusZone>
          </div>
        )}
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div>
          <Title text='Přístup zakázán' />
          <div className='heading'>
            <h1>Přístup zakázán</h1>
          </div>
        </div>
      </UnauthenticatedTemplate>
    </div>
  );
})`
  .heading,
  .list {
    margin: 1em;
    margin-left: 2em;
  }
`;

export default MojeVypujcky;
