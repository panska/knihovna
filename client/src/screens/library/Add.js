import React, { useState, useContext } from 'react';
import { Context } from '../../components/App';
import { Breadcrumb, TextField, PrimaryButton } from '@fluentui/react';
import { useMsal, useAccount } from '@azure/msal-react';
import { withRouter } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { loginRequest } from '../../config/config';
import axios from 'axios';

const Add = withRouter(({ history }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [state, dispatch] = useContext(Context);
  const { handleSubmit, errors, control } = useForm();
  const [book, setBook] = useState(false);

  if (state.permissions && state.permissions.includes('SPRAVCE_KNIHOVNY')) {
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
              text: 'Správa',
              key: 'f2',
              pathname: '/knihovna/sprava',
              onClick: (event, item) => {
                event.preventDefault();
                history.push(item.pathname);
              },
            },
            {
              text: 'Přidat knihu do databáze',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!book && (
          <>
            <div className='manage form heading'>
              <h1>Přidat knihu do databáze</h1>
              <p>
                Údaje ověřujte na{' '}
                <a href='https://aleph.nkp.cz/F/4HC3JRY8K45IAI1CBHEV2YSYF5PDK8UMCG5QCVSFQNTLLGA9SI-15557?func=file&file_name=find-b&local_base=NKC'>
                  nkp.cz
                </a>
                . Obálky jsou dostupné na{' '}
                <a href='https://obalkyknih.cz/'>obalkyknih.cz</a>.
              </p>
            </div>
            <div className='manage form container'>
              <form
                id='manage-library-add-form'
                onSubmit={handleSubmit(async (data) => {
                  if (account) {
                    instance
                      .acquireTokenSilent({
                        ...loginRequest,
                        account: account,
                      })
                      .then(async (res) => {
                        await axios
                          .post(
                            `${process.env.REACT_APP_HOSTNAME}/api/book/create`,
                            {
                              data,
                            },
                            {
                              headers: {
                                Authorization: res.idToken,
                              },
                            }
                          )
                          .then((res) => {
                            setBook(res.data[0]);
                          })
                          .catch((err) => {
                            console.log(err.response.message);
                          });
                      });
                  }
                })}
                noValidate
              >
                <Controller
                  as={
                    <TextField
                      label='ISBN'
                      placeholder='978-80-7287-181-0'
                      errorMessage={
                        errors.isbn && 'Formát ISBN kódu je nesprávný.'
                      }
                      required
                    />
                  }
                  name='isbn'
                  control={control}
                  rules={{
                    required: true,
                    // eslint-disable-next-line no-useless-escape
                    pattern: /^(?:ISBN(?:-13)?:?\ )?(?=[0-9]{13}$|(?=(?:[0-9]+[-\ ]){4})[-\ 0-9]{17}$)97[89][-\ ]?[0-9]{1,5}[-\ ]?[0-9]+[-\ ]?[0-9]+[-\ ]?[0-9]$/,
                  }}
                />

                <Controller
                  as={
                    <TextField
                      label='Název'
                      placeholder='Rozmarné léto'
                      required
                    />
                  }
                  name='name'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='Autor'
                      placeholder='Vančura Vladislav'
                      description='Pište formou Příjmení Jméno.'
                      required
                    />
                  }
                  name='author'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='Forma, žánr'
                      description='Žánry rozdělte pouze čárkami bez mezer.'
                      placeholder='české novely,humoristické novely'
                      required
                    />
                  }
                  name='genre'
                  control={control}
                  rules={{ required: true, pattern: /[^,\s?]+/ }}
                />

                <Controller
                  as={
                    <TextField
                      label='Odkaz k obálce'
                      placeholder='https://www.obalkyknih.cz/file/cover/736212/medium'
                      required
                    />
                  }
                  name='cover'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={<TextField label='Počet svazků' required />}
                  name='total'
                  defaultValue='1'
                  control={control}
                  rules={{ required: true, pattern: /^\d+$/ }}
                />

                <PrimaryButton className='submit' text='Přidat' type='submit' />
              </form>
            </div>
          </>
        )}

        {book && (
          <>
            <div className='manage form heading'>
              <h1>Kniha byla úspěšné přidána do databáze</h1>
            </div>
            <div className='manage form container'>
              <table>
                <tr>
                  <th>ID</th>
                  <td>{book.id}</td>
                </tr>
                <tr>
                  <th>ISBN</th>
                  <td>{book.isbn}</td>
                </tr>
                <tr>
                  <th>Název</th>
                  <td>{book.name}</td>
                </tr>
                <tr>
                  <th>Autor</th>
                  <td>{book.author}</td>
                </tr>
                <tr>
                  <th>Forma, žánr</th>
                  <td>{book.genre}</td>
                </tr>
                <tr>
                  <th>Odkaz k obálce</th>
                  <td>
                    <a href={book.cover}>{book.cover}</a>
                  </td>
                </tr>
                <tr>
                  <th>Počet svazků</th>
                  <td>{book.total}</td>
                </tr>
              </table>
            </div>
          </>
        )}
      </>
    );
  } else {
    return (
      <>
        <div className='heading'>
          <h1>Přístup zakázán.</h1>
        </div>
      </>
    );
  }
});

export default Add;
