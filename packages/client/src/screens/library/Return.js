import React, { useState, useContext } from 'react';
import { Context } from '../../components/App';
import { TextField, PrimaryButton, Breadcrumb } from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest } from '../../config/config';
import axios from 'axios';

const Return = withRouter(({ history }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const { handleSubmit, errors, control } = useForm();
  const [state, dispatch] = useContext(Context);
  const [returned, setReturned] = useState();

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
              text: 'Vrátit knihu',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!returned && (
          <>
            <div className='manage form heading'>
              <h1>Vrátit knihu</h1>
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
                            `${process.env.REACT_APP_HOSTNAME}/api/book/return`,
                            {
                              borrowerEmail: data.email,
                              bookId: data.id,
                            },
                            {
                              headers: {
                                Authorization: res.idToken,
                              },
                            }
                          )
                          .then((res) => {
                            setReturned(true);
                          });
                      });
                  }
                })}
                noValidate
              >
                <Controller
                  as={<TextField label='ID knihy' placeholder='1' required />}
                  name='id'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='E-mail čtenáře'
                      placeholder='20GKovacevicM@student.panska.cz'
                      type='email'
                      required
                    />
                  }
                  name='email'
                  control={control}
                  rules={{ required: true }}
                />

                <PrimaryButton className='submit' text='Vrátit' type='submit' />
              </form>
            </div>
          </>
        )}

        {returned && (
          <>
            <div className='manage form heading'>
              <h1>Kniha byla uspěšně vrácena</h1>
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

export default Return;
