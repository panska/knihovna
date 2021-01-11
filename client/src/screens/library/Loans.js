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
  MessageBar,
  MessageBarType,
  Link,
} from '@fluentui/react';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
  useAccount,
  useIsAuthenticated,
} from '@azure/msal-react';
import axios from 'axios';

const Loans = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const isAuthenticated = useIsAuthenticated();
  const [items, setItems] = useState({ current: [], past: [] });

  useEffect(() => {
    axios
      .get(
        `http://localhost:5000/api/user/${
          account && account.localAccountId
        }/loans`
      )
      .then((res) => {
        let current = [
          res.data
            .filter((bookLoan) => {
              return bookLoan.returned !== true;
            })
            .map((bookLoan) => {
              return {
                cover: bookLoan.Book.cover,
                key: bookLoan.Book.id,
                name: bookLoan.Book.name,
                description: `vrátit do ${new Date(
                  bookLoan.returnDate
                ).toLocaleDateString('cs-CZ')}`,
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
                cover: bookLoan.Book.cover,
                key: bookLoan.Book.id,
                name: bookLoan.Book.name,
                description: `vypůjčeno ${new Date(
                  bookLoan.borrowDate
                ).toLocaleDateString('cs-CZ')}`,
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
      <div className={classNames.itemCell} data-is-focusable={true}>
        <Image
          className={classNames.itemImage}
          src={item.cover}
          width={40}
          height={60}
          imageFit={ImageFit.cover}
        />
        <div className={classNames.itemContent}>
          <div className={classNames.itemName}>{item.name}</div>
          <div className={classNames.itemIndex}>{item.description}</div>
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
    <div className='loans'>
      <AuthenticatedTemplate>
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
          Knihovna je v této době v omezeném provozu.
          <Link href='#' target='_blank'>
            Více informací.
          </Link>
        </MessageBar>
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
          <div className='manage form container'>
            <h1>Přístup zakázán.</h1>
          </div>
        </div>
      </UnauthenticatedTemplate>
    </div>
  );
};

export default Loans;
