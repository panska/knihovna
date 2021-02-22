import React, { useState } from 'react';
import { TextField, PrimaryButton, Breadcrumb } from '@fluentui/react';
import { withRouter, useLocation } from 'react-router-dom';
import axios from 'axios';

const Book = withRouter(({ history }) => {
  const {
    source,
    id,
    isbn,
    name,
    authorFamilyName,
    authorGivenName,
    coverUrl,
    genre,
    annotation,
    publicationYear,
    publisher,
    origin,
    graduationReading,
  } = useLocation().state;

  return (
    <>
      <Breadcrumb
        className='breadcrumb'
        items={[
          {
            text: 'Knihovna',
            key: 'f1',
            as: 'p',
          },
          {
            text: 'Katalog',
            key: 'f2',
            pathname: '/knihovna/katalog',
            onClick: (event, item) => {
              event.preventDefault();
              history.push(item.pathname);
            },
          },
          {
            text: name,
            key: 'f3',
            as: 'p',
          },
        ]}
      />

      <div className='book container'>
        <img src={coverUrl} alt='Knižní obálka' />
        <div className='info'>
          <h1>
            {name} <span className='id'>({id})</span>
          </h1>
          <p>
            Autor:{' '}
            <span className='details'>
              {authorFamilyName}, {authorGivenName}
            </span>
          </p>
          <p>
            Anotace: <span className='details annotation'>{annotation}</span>
          </p>
          <p>
            Žánr: <span className='details'>{genre}</span>
          </p>
          <p>
            Rok vydání: <span className='details'>{publicationYear}</span>
          </p>
          <p>
            Vydavatel: <span className='details'>{publisher}</span>
          </p>
          <p>
            ISBN: <span className='details'>{isbn}</span>
          </p>
        </div>
      </div>
    </>
  );
});

export default Book;
