import React, { useState, useContext } from 'react';
import { Context } from '../../components/App';
import {
  TextField,
  PrimaryButton,
  Breadcrumb,
  Dropdown,
  DatePicker,
  DayOfWeek,
  MaskedTextField,
  concatStyleSetsWithProps,
} from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest } from '../../config/config';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Title from '../../components/Title';

const Edit = withRouter(({ history }) => {
  const { handleSubmit, errors, control } = useForm();
  const [editing, setEditing] = useState();
  const [editingError, setEditingError] = useState();
  const [edited, setEdited] = useState(false);
  const [state, dispatch] = useContext(Context);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  if (
    state.permissions &&
    state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
  ) {
    return (
      <>
        <Title text='Upravit naplánovanou projekci' />
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
              text: 'Upravit naplánovanou projekci',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!edited && !editing && !editingError && (
          <>
            <div className='manage form heading'>
              <h1>Upravit naplánovanou projekci</h1>
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
                          .get(`/api/projection/${data.id}`, {
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
                  as={<TextField label='ID projekce' required />}
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
            <h1>Projekce nebyla nalezena</h1>
          </div>
        )}

        {editing && !edited && (
          <>
            <div className='manage form heading'>
              <h1>Upravit naplánovanou projekci</h1>
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
                        data.date.setHours(parseInt(data.time.substring(0, 2)));
                        data.date.setMinutes(
                          parseInt(data.time.substring(3, 5))
                        );
                        data.start = new Date(data.date);
                        await axios
                          .post(
                            '/api/projection/edit',
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
                  render={({ onChange, value }) => (
                    <Dropdown
                      placeholder='Vyberte možnost'
                      label='Typ projekce'
                      selectedKey={value}
                      // eslint-disable-next-line react/jsx-no-bind
                      onChange={(ev, option, index) => {
                        onChange(option.key);
                      }}
                      options={[
                        {
                          key: 'živá',
                          text: 'živá',
                        },
                        {
                          key: 'virtuální',
                          text: 'virtuální',
                        },
                      ]}
                      required
                    />
                  )}
                  name='type'
                  defaultValue={editing.type}
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  as={<TextField label='Název filmu' required />}
                  name='movieName'
                  defaultValue={editing.movieName}
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  as={
                    <TextField
                      label='Stručná data'
                      multiline
                      rows={2}
                      required
                    />
                  }
                  name='movieData'
                  defaultValue={editing.movieData}
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  as={<TextField label='Filmový plakát' required />}
                  name='moviePoster'
                  defaultValue={editing.moviePoster}
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  render={({ onChange, value }) => (
                    <DatePicker
                      label='Datum projekce'
                      isRequired={true}
                      showMonthPickerAsOverlay={true}
                      value={new Date(editing.start)}
                      onSelectDate={(date) => {
                        if (!date) {
                          return;
                        }
                        onChange(date);
                      }}
                      firstDayOfWeek={DayOfWeek.Monday}
                      strings={{
                        months: [
                          'Leden',
                          'Únor',
                          'Březen',
                          'Duben',
                          'Květen',
                          'Červen',
                          'Červenec',
                          'Srpen ',
                          'Září',
                          'Říjen',
                          'Listopad',
                          'Prosinec',
                        ],
                        shortMonths: [
                          'Led',
                          'Úno',
                          'Bře',
                          'Dub',
                          'Kvě',
                          'Čer',
                          'Čer',
                          'Srp',
                          'Zář',
                          'Říj',
                          'Lis',
                          'Pro',
                        ],
                        days: [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ],
                        shortDays: ['N', 'P', 'U', 'S', 'Č', 'P', 'S'],
                        goToToday: 'K dnešku',
                        isRequiredErrorMessage: 'Datum projekce je nutný.',
                      }}
                      placeholder='Vybrat datum'
                      minDate={new Date()}
                    />
                  )}
                  name='date'
                  defaultValue={new Date(editing.start)}
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  as={
                    <MaskedTextField
                      label='Začátek projekce'
                      mask='99:99'
                      required
                    />
                  }
                  name='time'
                  defaultValue={new Date(editing.start)
                    .toLocaleString('cs-CZ', {
                      minimumIntegerDigits: 2,
                    })
                    .substring(11, 17)}
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

        {edited && (
          <div className='manage form heading'>
            <h1>Projekce byla úspěšné upravená</h1>
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

export default Edit;
