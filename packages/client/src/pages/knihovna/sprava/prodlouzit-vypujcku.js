import React, { useContext, useState } from 'react';
import { Context } from '../../../components/App';
import {
  Breadcrumb,
  PrimaryButton,
  Dropdown,
  TextField,
} from '@fluentui/react';
import { useForm, Controller } from 'react-hook-form';
import { withRouter } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest } from '../../../config/config';
import axios from 'axios';
import Title from '../../../components/Title';

const ProdlouzitVypujcku = withRouter(({ history }) => {
  const [state, dispatch] = useContext(Context);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [extended, setExtended] = useState();
  const { handleSubmit, errors, control } = useForm();
  const [selectedOption, setSelectedOption] = useState();

  if (state.permissions && state.permissions.includes('SPRAVCE_KNIHOVNY')) {
    return (
      <>
        <Title text='Prodloužit výpůjčku' />
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
              text: 'Prodloužit výpůjčku',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!extended && (
          <>
            <div className='manage form heading'>
              <h1>Prodloužit výpůjčku</h1>
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
                          .put(
                            '/api/book/loan',
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
                            setExtended(true);
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
                  as={<TextField label='ID výpůjčky' required />}
                  name='id'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  render={({ onChange, value }) => (
                    <Dropdown
                      placeholder='Vyberte možnost'
                      label='Doba prodloužení'
                      selectedKey={value}
                      // eslint-disable-next-line react/jsx-no-bind
                      onChange={(ev, option, index) => {
                        setSelectedOption(option.key);
                        onChange(option.key);
                      }}
                      options={[
                        {
                          key: '7',
                          text: 'týden',
                        },
                        {
                          key: '14',
                          text: '14 dní',
                        },
                        {
                          key: '31',
                          text: 'měsíc',
                        },
                      ]}
                      required
                    />
                  )}
                  name='period'
                  control={control}
                  rules={{ required: true }}
                />

                <PrimaryButton
                  className='submit'
                  text='Prodloužit'
                  type='submit'
                />
              </form>
            </div>
          </>
        )}

        {extended && (
          <>
            <div className='manage form heading'>
              <h1>Výpůjčka byla úspěšně prodloužená.</h1>
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

export default ProdlouzitVypujcku;
