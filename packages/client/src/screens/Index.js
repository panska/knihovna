import React, { useState, useEffect } from 'react';
import Title from '../components/Title';
import { Image, ImageFit } from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { resolveDefaultCover } from '../utils/resolveDefaultCover';

const Index = withRouter(({ history }) => {
  const [newBooks, setNewBooks] = useState([]);

  useEffect(() => {
    axios.get('/api/book/new').then((res) => {
      setNewBooks(res.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='index'>
      <Title text='Studentský portál' />
      <div className='heading'>
        <h1>Novinky v knihovně</h1>
      </div>
      <div className='container'>
        <ul className='books'>
          {newBooks.map((book) => (
            <li
              className='book'
              onClick={(event) => {
                event.preventDefault();
                history.push('/knihovna/kniha', {
                  source: {
                    text: 'Úvod',
                    pathname: '/',
                  },
                  ...book,
                });
              }}
            >
              <Image
                src={book.coverUrl ? book.coverUrl : resolveDefaultCover()}
                width={127.5}
                height={185}
                imageFit={ImageFit.coverUrl}
              />
              <h1>{book.name}</h1>
              <p className='author'>
                {book.authorFamilyName && book.authorGivenName
                  ? `${book.authorFamilyName}, ${book.authorGivenName}`
                  : book.authorFamilyName
                  ? `${book.authorFamilyName}`
                  : book.authorGivenName
                  ? `${book.authorGivenName}`
                  : undefined}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default Index;
