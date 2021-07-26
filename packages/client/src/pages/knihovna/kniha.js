import React from 'react';
import { Breadcrumb } from '@fluentui/react';
import { withRouter, useLocation } from 'react-router-dom';
import ShowMoreText from 'react-show-more-text';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import Title from '../../components/Title';
import { resolveDefaultCover } from '../../utils/resolveDefaultCover';

const Kniha = styled(
  withRouter(({ className, history }) => {
    const {
      source,
      id,
      inventoryNumber,
      isbn,
      cnb,
      name,
      authorGivenName,
      authorFamilyName,
      pages,
      coverUrl,
      genre,
      annotation,
      resume,
      publicationYear,
      publisher,
      registrationYear,
      origin,
      purchasePrice,
      deaccessYear,
      graduationReading,
    } = useLocation().state;

    return (
      <div className={className}>
        <Title text={name} />
        <Helmet
          meta={[
            {
              property: 'og:title',
              content: name,
            },
            {
              property: 'og:description',
              content: annotation ? annotation : resume && resume,
            },
            {
              property: 'og:type',
              content: 'book',
            },
            {
              property: 'og:image',
              content: coverUrl ? coverUrl : resolveDefaultCover(),
            },
          ]}
        />
        <Breadcrumb
          className='breadcrumb'
          items={[
            ...(source.text !== 'Úvod'
              ? [
                  {
                    text: 'Knihovna',
                    key: 'f1',
                    as: 'p',
                  },
                ]
              : []),
            {
              text: source.text,
              key: 'f2',
              pathname: source.pathname,
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

        <div className='container'>
          <img
            src={coverUrl ? coverUrl : resolveDefaultCover()}
            alt='Knižní obálka'
          />
          <div className='info'>
            <h1>{name}</h1>
            <ShowMoreText
              lines={3}
              more='...celý text'
              less='...zkrácený text'
              expanded={false}
              width={525}
            >
              {annotation ? annotation : resume && resume}
            </ShowMoreText>
            <div className='details'>
              <table>
                <tbody>
                  {authorFamilyName && authorGivenName ? (
                    <tr>
                      <th>Autor</th>
                      <td>
                        {authorFamilyName}, {authorGivenName}
                      </td>
                    </tr>
                  ) : authorFamilyName ? (
                    <tr>
                      <th>Autor</th>
                      <td>{authorFamilyName}</td>
                    </tr>
                  ) : authorGivenName ? (
                    <tr>
                      <th>Autor</th>
                      <td>{authorGivenName}</td>
                    </tr>
                  ) : undefined}

                  {publicationYear && publisher ? (
                    <tr>
                      <th>Vydáno</th>
                      <td>
                        {publicationYear}, {publisher}
                      </td>
                    </tr>
                  ) : publicationYear ? (
                    <tr>
                      <th>Vydáno</th>
                      <td>{publicationYear}</td>
                    </tr>
                  ) : publisher ? (
                    <tr>
                      <th>Vydáno</th>
                      <td>{publisher}</td>
                    </tr>
                  ) : undefined}

                  {genre && (
                    <tr>
                      <th>Forma, žánr</th>
                      <td>{genre}</td>
                    </tr>
                  )}

                  {pages && (
                    <tr>
                      <th>Počet stran</th>
                      <td>{pages}</td>
                    </tr>
                  )}

                  {isbn ? (
                    <tr>
                      <th>ISBN</th>
                      <td>{isbn}</td>
                    </tr>
                  ) : (
                    cnb && (
                      <tr>
                        <th>Číslo nár.bibl.</th>
                        <td>{cnb}</td>
                      </tr>
                    )
                  )}

                  {inventoryNumber == id ? (
                    <tr>
                      <th>Inventární číslo</th>
                      <td>{inventoryNumber}</td>
                    </tr>
                  ) : (
                    <>
                      {inventoryNumber && (
                        <tr>
                          <th>Inventární číslo</th>
                          <td>{inventoryNumber}</td>
                        </tr>
                      )}
                      {id && (
                        <tr>
                          <th>Systémové číslo</th>
                          <td>{id}</td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  })
)`
  .container {
    margin: 0.5em;
    margin-left: 2em;
    display: grid;
    grid-template-columns: auto 1fr;
  }
  img {
    margin-top: 0.5em;
  }
  .info {
    margin-left: 1em;
  }
  .info p {
    padding-bottom: 0.25em;
  }
  .detail.annotation {
    line-height: 1.5em;
  }
`;

export default Kniha;
