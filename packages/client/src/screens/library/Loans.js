import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../components/App';
import {
  Link,
  DetailsList,
  SelectionMode,
  SearchBox,
  Breadcrumb,
} from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { resolveDefaultCover } from '../../utils/resolveDefaultCover';
import Title from '../../components/Title';

const Loans = withRouter(({ history }) => {
  const [state, dispatch] = useContext(Context);
  const [items, setItems] = useState({
    sortedItems: [],
    columns: [
      {
        name: 'ID',
        fieldName: 'id',
        minWidth: 17.5,
        maxWidth: 17.5,
        isResizable: true,
      },
      {
        name: 'Čtenář',
        fieldName: 'reader',
        minWidth: 125,
        maxWidth: 125,
        isResizable: true,
      },
      {
        name: 'Kniha',
        fieldName: 'book',
        minWidth: 125,
        maxWidth: 125,
        isResizable: true,
      },
      {
        name: 'Půjč. od',
        fieldName: 'borrowDate',
        maxWidth: 100,
        isResizable: true,
      },
      {
        name: 'Půjč. do',
        fieldName: 'returnDate',
        maxWidth: 100,
        isResizable: true,
      },
      {
        name: 'Vráceno',
        fieldName: 'returned',
        maxWidth: 125,
        isResizable: true,
      },
      {
        name: 'Datum vrácení',
        fieldName: 'returnedDate',
        maxWidth: 100,
        isResizable: true,
      },
    ],
  });
  const [itemsCopy, setItemsCopy] = useState(items);

  useEffect(() => {
    axios.get('/api/book/loan/all').then((res) => {
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
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let lateReturn = new Date(item.returnDate) < currentDate;

    switch (column.fieldName) {
      case 'borrowDate':
      case 'returnedDate':
        return (
          <span>
            {fieldContent
              ? new Date(fieldContent).toLocaleDateString('cs-CZ')
              : ''}
          </span>
        );
      case 'returnDate':
        return (
          <span
            style={{
              color: lateReturn && '#d13438',
              fontWeight: lateReturn && 700,
            }}
          >
            {fieldContent
              ? new Date(fieldContent).toLocaleDateString('cs-CZ')
              : ''}
          </span>
        );
      case 'book':
        return (
          <Link
            as={RouterLink}
            to={{
              pathname: '/knihovna/kniha',
              state: {
                source: {
                  text: 'Výpůjčky',
                  pathname: '/knihovna/sprava/vypujcky',
                },
                ...item.Book,
              },
            }}
          >
            {item.Book.name}
          </Link>
        );
      case 'reader':
        return <span>{item.User.displayName}</span>;
      case 'returned':
        return <span>{item.returned ? 'ANO' : 'NE'}</span>;
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
    const byBookName = itemsCopy.sortedItems.filter((item) =>
      item.Book.name
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

    const byReader = itemsCopy.sortedItems.filter((item) =>
      item.User.displayName
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
      sortedItems: [...new Set([...byBookName, ...byReader])],
    });
  };

  if (state.permissions && state.permissions.includes('SPRAVCE_KNIHOVNY')) {
    return (
      <>
        <Title text='Výpůjčky' />
        <Breadcrumb
          className='breadcrumb'
          items={[
            {
              text: 'Knihovna',
              key: 'f1',
              as: 'p',
            },
            {
              text: 'Správa',
              key: 'f2',
              pathname: '/knihovna/sprava',
              onClick: (event, item) => {
                event.preventDefault();
                history.push(item.pathname);
              },
            },
            {
              text: 'Výpůjčky',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        <div className='loans'>
          <div className='manage form heading'>
            <h1>Výpůjčky</h1>
          </div>
          <div className='container'>
            <SearchBox
              className='search'
              placeholder='Vyhledávání podle názvu knihy nebo uživatelského jména čtenáře'
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
              style={{
                overflowX: 'hidden',
              }}
            />
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div>
        <Title text='Přístup zakázán' />
        <div className='heading'>
          <h1>Přístup zakázán</h1>
        </div>
      </div>
    );
  }
});

export default Loans;
