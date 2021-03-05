import React, { useState, useContext } from 'react';
import { Context } from '../../components/App';
import {
  TextField,
  PrimaryButton,
  Breadcrumb,
  Dialog,
  DialogFooter,
  DefaultButton,
  DialogType,
} from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest } from '../../config/config';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

const Remove = withRouter(({ history }) => {
  const { handleSubmit, errors, control } = useForm();
  const [data, setData] = useState();
  const [removed, setRemoved] = useState(false);
  const [state, dispatch] = useContext(Context);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [dialogHidden, setDialogHidden] = useState(true);
  const hideDialog = () => {
    setDialogHidden(true);
  };

  const modalProps = React.useMemo(
    () => ({
      titleAriaId: 'dialogLabel',
      subtitleAriaId: 'subTextLabel',
      isBlocking: false,
    }),
    []
  );

  const removeBook = async () => {
    if (account) {
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: account,
        })
        .then(async (res) => {
          await axios
            .post(
              '/api/book/delete',
              {
                id: data.id,
              },
              {
                headers: {
                  Authorization: res.idToken,
                },
              }
            )
            .then((res) => {
              setDialogHidden(true);
              setRemoved(true);
            });
        });
    }
  };
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
              text: 'Odstranit knihu z databáze',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!removed && (
          <>
            <div className='manage form heading'>
              <h1>Odstranit knihu z databáze</h1>
            </div>
            <div className='manage form container'>
              <form
                onSubmit={handleSubmit(async (data) => {
                  setData(data);
                  setDialogHidden(false);
                })}
                noValidate
              >
                <Controller
                  as={
                    <TextField
                      label='ID knihy'
                      description='Použijte identifikační kód uvedený v databázi.'
                      required
                    />
                  }
                  name='id'
                  control={control}
                  rules={{ required: true }}
                />

                <Dialog
                  hidden={dialogHidden}
                  onDismiss={hideDialog}
                  dialogContentProps={{
                    type: DialogType.normal,
                    title: 'Potvrzení',
                    subText:
                      'Opravdu chcete uvedenou knihu odstranit z databáze?',
                  }}
                  modalProps={modalProps}
                >
                  <DialogFooter>
                    <PrimaryButton
                      onClick={removeBook}
                      text='Ano, pokračovat'
                    />
                    <DefaultButton onClick={hideDialog} text='Zrušit' />
                  </DialogFooter>
                </Dialog>

                <PrimaryButton
                  className='submit'
                  text='Odstranit'
                  type='submit'
                />
              </form>
            </div>
          </>
        )}

        {removed && (
          <div className='manage form heading'>
            <h1>Kniha byla úspěšné odstraněna z databáze</h1>
          </div>
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

export default Remove;
