import React, { useState, useContext } from 'react';
import { Context } from '../../components/App';
import { useMsal, useAccount } from '@azure/msal-react';
import { TextField, PrimaryButton, Breadcrumb } from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { loginRequest } from '../../config/config';
import axios from 'axios';

const Borrow = withRouter(({ history }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const { handleSubmit, errors, control } = useForm();
  const [state, dispatch] = useContext(Context);
  const [loan, setLoan] = useState(false);

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
              text: 'Vypůjčit knihu',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!loan && (
          <>
            <div className='manage form heading'>
              <h1>Vypůjčit knihu</h1>
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
                            '/api/book/loan',
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
                            setLoan({
                              id: res.data.id,
                              borrowerEmail: data.email,
                              bookId: data.id,
                            });
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

                <PrimaryButton
                  className='submit'
                  text='Vypůjčit'
                  type='submit'
                />
              </form>
            </div>
          </>
        )}

        {loan && (
          <>
            <div className='manage form heading'>
              <h1>Kniha byla úspěšně vypůjčená</h1>
            </div>
            <div className='manage form container'>
              <table>
                <tr>
                  <th>ID vypůjčky</th>
                  <td>{loan.id}</td>
                </tr>
                <tr>
                  <th>ID knihy</th>
                  <td>{loan.bookId}</td>
                </tr>
                <tr>
                  <th>E-mail čtenáře</th>
                  <td>{loan.borrowerEmail}</td>
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
          <h1>Přístup zakázán</h1>
        </div>
      </>
    );
  }
});

export default Borrow;
