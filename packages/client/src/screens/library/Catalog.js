import React, { useState, useEffect } from 'react';
import {
  MessageBar,
  MessageBarType,
  Link,
  Image,
  ImageFit,
  SearchBox,
  List,
  FocusZone,
  FocusZoneDirection,
  mergeStyleSets,
  getFocusStyle,
  getTheme,
  Toggle,
} from '@fluentui/react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { resolveDefaultCover } from '../../utils/resolveDefaultCover';

const Catalog = () => {
  const [items, setItems] = useState([]);
  const [itemsCopy, setItemsCopy] = useState(items);
  const [graduationReading, setGraduationReading] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_HOSTNAME}/api/book/all`).then((res) => {
      let items = res.data.map((book) => {
        return {
          id: book.id,
          isbn: book.isbn,
          name: book.name,
          authorFamilyName: book.authorFamilyName,
          authorGivenName: book.authorGivenName,
          coverUrl: book.coverUrl,
          genre: book.genre,
          annotation: book.annotation,
          publicationYear: book.publicationYear,
          publisher: book.publisher,
          origin: book.origin,
          graduationReading: book.graduationReading,
        };
      });

      setItems(items);
      setItemsCopy(items);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeText = (ev, text) => {
    const byName = itemsCopy.filter((book) =>
      book.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(
          text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        )
    );

    const byAuthor = itemsCopy.filter((book) =>
      book.authorFamilyName
        .concat(book.authorGivenName)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(
          text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        )
    );

    let filtered = new Set([...byName, ...byAuthor]);
    if (graduationReading) {
      filtered = [...filtered].filter(
        (book) => book.graduationReading === true
      );
    }
    setItems([...filtered]);
  };

  const graduationReadingToggle = (ev, checked) => {
    setGraduationReading(checked);
    if (checked) {
      const filterGraduationReading = itemsCopy.filter(
        (book) => book.graduationReading === true
      );
      setItems([...new Set([...filterGraduationReading])]);
    } else {
      setItems(itemsCopy);
    }
  };

  const onRenderCell = (item, index, isScrolling) => {
    if (!item.coverUrl) {
      item.coverUrl = resolveDefaultCover();
    }

    return (
      <div
        className={classNames.itemCell}
        data-is-focusable={true}
        key={item.id}
      >
        <Image
          className={classNames.itemImage}
          src={item.coverUrl}
          width={42.5}
          height={60}
          imageFit={ImageFit.coverUrl}
        />
        <div className={classNames.itemContent}>
          <Link
            as={RouterLink}
            to={{
              pathname: '/knihovna/kniha',
              state: {
                source: 'catalog',
                ...item,
              },
            }}
            className={classNames.itemName}
          >
            {item.name}
          </Link>
          <div
            className={classNames.itemIndex}
          >{`${item.authorGivenName}, ${item.authorFamilyName}`}</div>
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
    <div className='catalog'>
      <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
        Knihovna je v této době v omezeném provozu.
        <Link href='/knihovna/katalog'>Více informací.</Link>
      </MessageBar>

      <div className='heading'>
        <h1>Katalog knihovny</h1>
        <p>
          Elektronický katalog knih je přehledná datábaze všech knih, které
          školní knihovna vlastní.
        </p>
      </div>

      <div className='container'>
        <SearchBox
          className='search'
          placeholder='Vyhledávání podle názvu nebo autora knihy'
          onChange={onChangeText}
        />

        <Toggle
          label='Zarhnout do výsledků vyhledávání pouze literární díla k ústní maturitní zkouškce'
          inlineLabel
          onChange={graduationReadingToggle}
        />

        <div className='list'>
          <FocusZone direction={FocusZoneDirection.vertical}>
            <div className={classNames.container} data-is-scrollable>
              <List items={items} onRenderCell={onRenderCell} />
            </div>
          </FocusZone>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
