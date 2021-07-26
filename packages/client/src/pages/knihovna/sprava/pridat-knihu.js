import React, { useState, useContext } from 'react';
import { Context } from '../../../components/App';
import {
  Breadcrumb,
  TextField,
  PrimaryButton,
  Dropdown,
  Checkbox,
} from '@fluentui/react';
import { useMsal, useAccount } from '@azure/msal-react';
import { withRouter } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { loginRequest } from '../../../config/config';
import axios from 'axios';
import Title from '../../../components/Title';

const PridatKnihu = withRouter(({ history }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [state, dispatch] = useContext(Context);
  const { handleSubmit, errors, control } = useForm();
  const [book, setBook] = useState(false);
  const [bookError, setBookError] = useState(false);

  if (state.permissions && state.permissions.includes('SPRAVCE_KNIHOVNY')) {
    return (
      <>
        <Title text='Přidat knihu do databáze' />
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

        {!book && !bookError && (
          <>
            <div className='manage form heading'>
              <h1>Přidat knihu do databáze</h1>
            </div>
            <div className='manage form container'>
              <form
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
                            '/api/book/create',
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
                            setBook(res.data);
                          })
                          .catch((err) => {
                            if (err.response.status == 409) {
                              setBookError(true);
                            }
                            console.log(err.response.message);
                          });
                      });
                  }
                })}
                noValidate
              >
                <Controller
                  as={<TextField label='ISBN' required />}
                  name='isbn'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={<TextField label='Název' required />}
                  name='name'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={<TextField label='Příjmení autora' required />}
                  name='authorFamilyName'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={<TextField label='Jméno autora' required />}
                  name='authorGivenName'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='Forma, žánr'
                      description='Žánry rozdělte pouze čárkami bez mezer.'
                    />
                  }
                  name='genre'
                  control={control}
                  rules={{
                    pattern: /[^,\s?]+/,
                  }}
                />

                <Controller
                  as={
                    <TextField
                      label='Odkaz k obálce'
                      description='Obálky jsou dostupné na obalkyknih.cz.'
                    />
                  }
                  name='coverUrl'
                  control={control}
                />

                <Controller
                  as={<TextField label='Anotace' multiline rows={3} />}
                  name='annotation'
                  control={control}
                />

                <Controller
                  as={<TextField label='Rok vydání' required />}
                  name='publicationYear'
                  control={control}
                  rules={{
                    required: true,
                    valueAsNumber: true,
                  }}
                />

                <Controller
                  as={<TextField label='Vydavatel' required />}
                  name='publisher'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={<TextField label='Rok zápisu' />}
                  name='registrationYear'
                  control={control}
                  rules={{
                    valueAsNumber: true,
                  }}
                />

                <Controller
                  as={<TextField label='Rok odpisu' />}
                  name='deaccessYear'
                  control={control}
                  rules={{
                    valueAsNumber: true,
                  }}
                />

                <Controller
                  render={({ onChange, value }) => (
                    <Dropdown
                      placeholder='Vyberte možnost'
                      label='Pořízeno'
                      selectedKey={value}
                      // eslint-disable-next-line react/jsx-no-bind
                      onChange={(ev, option, index) => {
                        onChange(option.key);
                      }}
                      options={[
                        {
                          key: 'Spolek rodičů',
                          text: 'Spolek rodičů',
                        },
                        {
                          key: 'SPŠST',
                          text: 'SPŠST',
                        },
                        {
                          key: 'dar',
                          text: 'dar',
                        },
                      ]}
                    />
                  )}
                  name='origin'
                  control={control}
                />

                <Controller
                  as={<TextField label='Cena' />}
                  name='purchasePrice'
                  control={control}
                  rules={{
                    valueAsNumber: true,
                  }}
                />

                <Controller
                  render={({ onChange, value }) => (
                    <Checkbox
                      className='graduationReadingInput'
                      label='Povinná četba k maturitě'
                      checked={value}
                      onChange={(ev, checked) => {
                        onChange(checked);
                      }}
                    />
                  )}
                  name='graduationReading'
                  control={control}
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
          </>
        )}

        {bookError && (
          <>
            <div className='manage form heading'>
              <h1>Kniha s zadaným ISBN už existuje v databázi</h1>
            </div>
          </>
        )}
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

export default PridatKnihu;
