import React, { useState, useContext } from 'react';
import { Context } from '../../../components/App';
import {
  TextField,
  PrimaryButton,
  Breadcrumb,
  Dropdown,
  Checkbox,
} from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest } from '../../../config/config';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Title from '../../../components/Title';

const UpravitZaznamKnihy = withRouter(({ history }) => {
  const { handleSubmit, errors, control } = useForm();
  const [editing, setEditing] = useState();
  const [editingError, setEditingError] = useState();
  const [edited, setEdited] = useState(false);
  const [state, dispatch] = useContext(Context);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  if (state.permissions && state.permissions.includes('SPRAVCE_KNIHOVNY')) {
    return (
      <>
        <Title text='Upravit záznam knihy' />
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
              text: 'Upravit záznam knihy',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!edited && !editing && !editingError && (
          <>
            <div className='manage form heading'>
              <h1>Upravit záznam knihy</h1>
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
                          .get(`/api/book/${data.id}?podle=id`, {
                            headers: {
                              Authorization: res.idToken,
                            },
                          })
                          .then((res) => {
                            if (!res.data) {
                              setEditingError(true);
                              return;
                            }

                            res.data.id = data.id;
                            setEditing(res.data);
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
                  as={<TextField label='ID knihy' required />}
                  name='id'
                  control={control}
                  rules={{ required: true }}
                />

                <PrimaryButton
                  className='submit'
                  text='Upravit'
                  type='submit'
                />
              </form>
            </div>
          </>
        )}

        {editingError && (
          <div className='manage form heading'>
            <h1>Kniha nebyla nalezena</h1>
          </div>
        )}

        {editing && !edited && (
          <>
            <div className='manage form heading'>
              <h1>Upravit záznam knihy</h1>
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
                        data.id = editing.id;
                        await axios
                          .post(
                            '/api/book/edit',
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
                            setEdited(true);
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
                  as={<TextField label='ISBN' />}
                  name='isbn'
                  control={control}
                  defaultValue={editing.isbn}
                />

                <Controller
                  as={<TextField label='Název' />}
                  name='name'
                  control={control}
                  defaultValue={editing.name}
                />

                <Controller
                  as={<TextField label='Příjmení autora' />}
                  name='authorFamilyName'
                  control={control}
                  defaultValue={editing.authorFamilyName}
                />

                <Controller
                  as={<TextField label='Jméno autora' />}
                  name='authorGivenName'
                  control={control}
                  defaultValue={editing.authorGivenName}
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
                  defaultValue={editing.genre}
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
                  defaultValue={editing.coverUrl}
                  control={control}
                />

                <Controller
                  as={<TextField label='Anotace' multiline rows={3} />}
                  name='annotation'
                  defaultValue={editing.annotation}
                  control={control}
                />

                <Controller
                  as={<TextField label='Rok vydání' />}
                  name='publicationYear'
                  defaultValue={
                    editing.publicationYear
                      ? editing.publicationYear
                      : undefined
                  }
                  control={control}
                  rules={{
                    valueAsNumber: true,
                  }}
                />

                <Controller
                  as={<TextField label='Vydavatel' />}
                  name='publisher'
                  defaultValue={editing.publisher}
                  control={control}
                />

                <Controller
                  as={<TextField label='Rok zápisu' />}
                  name='registrationYear'
                  defaultValue={
                    editing.registrationYear
                      ? editing.registrationYear
                      : undefined
                  }
                  control={control}
                  rules={{
                    valueAsNumber: true,
                  }}
                />

                <Controller
                  as={<TextField label='Rok odpisu' />}
                  name='deaccessYear'
                  defaultValue={
                    editing.deaccessYear ? editing.deaccessYear : undefined
                  }
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
                  defaultValue={editing.origin}
                  control={control}
                />

                <Controller
                  as={<TextField label='Cena' />}
                  name='purchasePrice'
                  defaultValue={
                    editing.purchasePrice ? editing.purchasePrice : undefined
                  }
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
                      defaultChecked={editing.graduationReading}
                    />
                  )}
                  defaultValue={editing.graduationReading}
                  name='graduationReading'
                  control={control}
                />

                <PrimaryButton
                  className='submit'
                  text='Upravit'
                  type='submit'
                />
              </form>
            </div>
          </>
        )}

        {edited && (
          <div className='manage form heading'>
            <h1>Kniha byla úspěšné upravená</h1>
          </div>
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

export default UpravitZaznamKnihy;
