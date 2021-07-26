import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../../components/App';
import {
  Link,
  DetailsList,
  SelectionMode,
  SearchBox,
  Breadcrumb,
} from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import Title from '../../../components/Title';

const Projekce = styled(
  withRouter(({ className, history }) => {
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
          name: 'Typ projekce',
          fieldName: 'type',
          minWidth: 100,
          maxWidth: 100,
          isResizable: true,
        },
        {
          name: 'Název filmu',
          fieldName: 'movieName',
          minWidth: 100,
          maxWidth: 100,
          isResizable: true,
        },
        {
          name: 'Začátek projekce',
          fieldName: 'time',
          maxWidth: 100,
          isResizable: true,
        },
        {
          name: 'Stručná data',
          fieldName: 'movieData',
          maxWidth: 100,
          isResizable: true,
        },
        {
          name: 'Filmový plakát',
          fieldName: 'moviePoster',
          maxWidth: 100,
          isResizable: true,
        },
      ],
    });
    const [itemsCopy, setItemsCopy] = useState(items);

    useEffect(() => {
      axios.get('/api/projection/all').then((res) => {
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

      switch (column.fieldName) {
        case 'time':
          return (
            <span>
              {item.start
                ? new Date(item.start).toLocaleString('cs-CZ', {
                    minimumIntegerDigits: 2,
                  })
                : ''}
            </span>
          );
        case 'moviePoster':
          return <a href={item.moviePoster}>{fieldContent}</a>;
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
      const byMovieName = itemsCopy.sortedItems.filter((item) =>
        item.movieName
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

      const byID = itemsCopy.sortedItems.filter((item) =>
        item.id
          .toString()
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
        sortedItems: [...new Set([...byMovieName, ...byID])],
      });
    };

    if (
      state.permissions &&
      state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
    ) {
      return (
        <div className={className}>
          <Title text='Projekce' />
          <Breadcrumb
            className='breadcrumb'
            items={[
              {
                text: 'Filmový klub',
                key: 'f1',
                as: 'p',
              },
              {
                text: 'Správa',
                key: 'f2',
                pathname: '/filmovy-klub/sprava',
                onClick: (event, item) => {
                  event.preventDefault();
                  history.push(item.pathname);
                },
              },
              {
                text: 'Projekce',
                key: 'f3',
                as: 'p',
              },
            ]}
          />

          <div className='manage form heading'>
            <h1>Projekce</h1>
          </div>
          <div className='container'>
            <SearchBox
              className='search'
              placeholder='Vyhledávání podle ID projekce nebo názvu filmu'
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
  })
)`
  .container {
    margin-left: 2em;
  }
  .search {
    margin-top: 1em;
    width: 480px;
  }
  .list {
    width: 960px;
  }
`;

export default Projekce;
