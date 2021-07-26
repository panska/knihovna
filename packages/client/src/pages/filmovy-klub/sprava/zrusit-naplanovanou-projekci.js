import React, { useState, useContext } from 'react';
import { Context } from '../../../components/App';
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
import { loginRequest } from '../../../config/config';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Title from '../../../components/Title';

const ZrusitNaplanovanouProjekci = withRouter(({ history }) => {
  const { handleSubmit, errors, control } = useForm();
  const [data, setData] = useState();
  const [canceled, setCanceled] = useState(false);
  const [state, dispatch] = useContext(Context);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [dialogHidden, setDialogHidden] = useState(true);
  const hideDialog = () => {
    setDialogHidden(true);
  };
  const [projectionError, setProjectionError] = useState();

  const modalProps = React.useMemo(
    () => ({
      titleAriaId: 'dialogLabel',
      subtitleAriaId: 'subTextLabel',
      isBlocking: false,
    }),
    []
  );

  const removeProjection = async () => {
    if (account) {
      instance
        .acquireTokenSilent({
          ...loginRequest,
          account: account,
        })
        .then(async (res) => {
          await axios
            .post(
              '/api/projection/delete',
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
              setCanceled(true);
            })
            .catch((err) => {
              if (err.response.status == 400) {
                setDialogHidden(true);
                setProjectionError(true);
              }
              console.log(err.response.message);
            });
        });
    }
  };

  if (
    state.permissions &&
    state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
  ) {
    return (
      <>
        <Title text='Zrušit naplánovanou projekci' />
        <Breadcrumb
          className='breadcrumb'
          items={[
            {
              text: 'Filmový klub',
              key: 'f1',
              as: 'p',
            },
            {
              text: 'Správa',
              key: 'f2',
              pathname: '/filmovy-klub/sprava',
              onClick: (event, item) => {
                event.preventDefault();
                history.push(item.pathname);
              },
            },
            {
              text: 'Zrušit naplánovanou projekci',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!canceled && !projectionError && (
          <>
            <div className='manage form heading'>
              <h1>Zrušit naplánovanou projekci</h1>
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
                  as={<TextField label='ID projekce' required />}
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
                    subText: 'Opravdu chcete uvedenou projekci zrušit?',
                  }}
                  modalProps={modalProps}
                >
                  <DialogFooter>
                    <PrimaryButton
                      onClick={removeProjection}
                      text='Ano, pokračovat'
                    />
                    <DefaultButton onClick={hideDialog} text='Zrušit' />
                  </DialogFooter>
                </Dialog>

                <PrimaryButton className='submit' text='Zrušit' type='submit' />
              </form>
            </div>
          </>
        )}

        {projectionError && (
          <div className='manage form heading'>
            <h1>Projekce nebyla nalezena</h1>
          </div>
        )}

        {canceled && (
          <div className='manage form heading'>
            <h1>Projekce byla úspěšné zrušená</h1>
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

export default ZrusitNaplanovanouProjekci;
