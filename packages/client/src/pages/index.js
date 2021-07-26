import React, { useState, useEffect } from 'react';
import Title from '../components/Title';
import { Image, ImageFit } from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { resolveDefaultCover } from '../utils/resolveDefaultCover';

const Index = styled(
  withRouter(({ className, history }) => {
    const [newBooks, setNewBooks] = useState([]);
    const [nextProjection, setNextProjection] = useState();

    useEffect(() => {
      axios.get('/api/book/new').then((res) => {
        setNewBooks(res.data);
      });

      axios.get('/api/projection/all').then((res) => {
        let diffdate = new Date();
        let sorted = res.data.sort((a, b) => {
          let distancea = Math.abs(diffdate - new Date(a.start));
          let distanceb = Math.abs(diffdate - new Date(b.start));
          return distancea - distanceb;
        });
        let future = sorted.filter((d) => {
          return new Date(d.start) - diffdate > 0;
        });

        setNextProjection(future[0]);
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className={className}>
        <Title text='Studentský portál' />
        {newBooks && (
          <>
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
                      src={
                        book.coverUrl ? book.coverUrl : resolveDefaultCover()
                      }
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
          </>
        )}

        {nextProjection && (
          <>
            <div className='heading'>
              <h1>Další projekce ve filmovém klubu</h1>
            </div>
            <div
              className='cinema'
              style={{ marginTop: 0, maxHeight: '137px', marginBottom: '2em' }}
            >
              <div className='playing' style={{ maxWidth: '360px' }}>
                <div>
                  <img src={nextProjection.moviePoster} className='poster' />
                </div>
                <div className='info'>
                  <p className='about'>Příští projekce</p>
                  <h1 className='title'>{nextProjection.movieName}</h1>
                  <p className='description'>{nextProjection.movieData}</p>
                  <p className='start'>
                    {nextProjection.type},{' '}
                    {new Date(nextProjection.start).toLocaleString('cs')}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  })
)`
  .container {
    margin-left: 2em;
  }
  .books {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5em;
  }
  .book {
    width: 127.5px;
    float: left;
    display: block;
    overflow: hidden;
  }
  .book:hover {
    cursor: pointer;
  }
  .book h1 {
    color: rgb(0, 120, 212);
    margin-top: 0.5em;
    font-weight: 400;
    font-size: 1em;
  }
  .book h1:hover {
    text-decoration: underline;
  }
  .book .author {
    font-size: 0.75em;
    opacity: 0.75;
  }
`;

export default Index;
