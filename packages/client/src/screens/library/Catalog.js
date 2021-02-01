import React, { useState, useEffect } from 'react';
import {
  MessageBar,
  MessageBarType,
  Link,
  Image,
  ImageFit,
  DetailsList,
  SelectionMode,
  SearchBox,
} from '@fluentui/react';
import axios from 'axios';

const Catalog = () => {
  const [columns, setColumns] = useState();
  const [items, setItems] = useState({
    sortedItems: [],
    columns: [
      {
        key: 'cover',
        name: 'Obálka',
        fieldName: 'cover',
        minWidth: 50,
        maxWidth: 85,
        columnActionsMode: 1,
        isResizable: true,
      },
      {
        key: 'name',
        name: 'Název',
        fieldName: 'name',
        minWidth: 50,
        maxWidth: 125,
        columnActionsMode: 1,
        isResizable: true,
      },
      {
        key: 'author',
        name: 'Autor',
        fieldName: 'author',
        minWidth: 50,
        maxWidth: 125,
        columnActionsMode: 1,
        isResizable: true,
      },
      {
        key: 'genre',
        name: 'Forma, žánr',
        fieldName: 'genre',
        minWidth: 50,
        maxWidth: 162.5,
        columnActionsMode: 1,
        isResizable: true,
      },
      {
        key: 'total',
        name: 'Celkem svazků',
        fieldName: 'total',
        minWidth: 50,
        maxWidth: 97.25,
        columnActionsMode: 1,
        isResizable: true,
      },
      {
        key: 'available',
        name: 'K zapůjčení',
        fieldName: 'available',
        minWidth: 50,
        maxWidth: 97.25,
        columnActionsMode: 1,
        isResizable: true,
      },
    ],
  });
  const [itemsCopy, setItemsCopy] = useState(items);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_HOSTNAME}/api/book/all`).then((res) => {
      setColumns(columns);
      setItems({
        sortedItems: res.data,
        columns: items.columns,
      });
      setItemsCopy({
        sortedItems: res.data,
        columns: items.columns,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onColumnClick = (event, column) => {
    const { columns } = items;
    let { sortedItems } = items;
    let isSortedDescending = column.isSortedDescending;

    if (column.isSorted) {
      isSortedDescending = !isSortedDescending;
    }

    sortedItems = copyAndSort(
      sortedItems,
      column.fieldName,
      isSortedDescending
    );

    setItems({
      sortedItems: sortedItems,
      columns: columns.map((col) => {
        col.isSorted = col.key === column.key;
        if (col.isSorted) {
          col.isSortedDescending = isSortedDescending;
        }
        return col;
      }),
    });
  };

  function renderItemColumn(item, index, column) {
    const fieldContent = item[column.fieldName];
    switch (column.key) {
      case 'cover':
        return (
          <Image
            src={fieldContent}
            width={80}
            height={120}
            imageFit={ImageFit.cover}
          />
        );
      case 'genre':
        return (
          <ul>
            {fieldContent.split(',').map((obj) => {
              return <li>{obj}</li>;
            })}
          </ul>
        );
      default:
        return <span>{fieldContent}</span>;
    }
  }

  const copyAndSort = (items, key, isSortedDescending) => {
    return items
      .slice(0)
      .sort((a, b) =>
        (isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1
      );
  };

  const onChangeText = (ev, text) => {
    const byName = itemsCopy.sortedItems.filter((book) =>
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

    const byAuthor = itemsCopy.sortedItems.filter((book) =>
      book.author
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

    setItems({
      columns: itemsCopy.columns,
      sortedItems: [...new Set([...byName, ...byAuthor])],
    });
  };

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

        <DetailsList
          className='list'
          selectionMode={SelectionMode.none}
          items={items.sortedItems}
          setKey='set'
          columns={items.columns}
          onRenderItemColumn={renderItemColumn}
          onColumnHeaderClick={onColumnClick}
        />
      </div>
    </div>
  );
};

export default Catalog;
