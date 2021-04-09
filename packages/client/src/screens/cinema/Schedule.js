import React, { useContext, useState } from 'react';
import { Context } from '../../components/App';
import {
  Breadcrumb,
  PrimaryButton,
  DatePicker,
  DayOfWeek,
  TextField,
  MaskedTextField,
  Dropdown,
} from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest } from '../../config/config';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import Title from '../../components/Title';

const Schedule = withRouter(({ history }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [state, dispatch] = useContext(Context);
  const { handleSubmit, errors, control } = useForm();
  const [scheduled, setScheduled] = useState();
  const [selectedOption, setSelectedOption] = useState();

  if (
    state.permissions &&
    state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
  ) {
    return (
      <>
        <Title text='Naplánovat projekci' />
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
              text: 'Naplánovat projekci',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!scheduled && (
          <div className='schedule'>
            <div className='manage form heading'>
              <h1>Naplánovat projekci</h1>
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
                        data.date.setHours(
                          new Date(data.date).getHours() +
                            parseInt(data.time.substring(0, 2))
                        );
                        data.date.setMinutes(
                          new Date(data.date).getMinutes() +
                            parseInt(data.time.substring(3, 5))
                        );
                        data.start = new Date(data.date);

                        await axios
                          .post(
                            '/api/projection/create',
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
                            setScheduled(true);
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
                        setSelectedOption(option.key);
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
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  as={<TextField label='Název filmu' required />}
                  name='movieName'
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
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  as={<TextField label='Filmový plakát' required />}
                  name='moviePoster'
                  control={control}
                  rules={{ required: true }}
                />
                <Controller
                  render={({ onChange, value }) => (
                    <DatePicker
                      label='Datum projekce'
                      isRequired={true}
                      showMonthPickerAsOverlay={true}
                      value={value}
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
                  control={control}
                  rules={{ required: true }}
                />
                <PrimaryButton
                  className='submit'
                  text='Naplánovat'
                  type='submit'
                />
              </form>
            </div>
          </div>
        )}

        {scheduled && (
          <>
            <div className='manage form heading'>
              <h1>Projekce byla úspěšné naplánována</h1>
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

export default Schedule;
