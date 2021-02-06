import React, { useState, useContext } from 'react';
import { Context } from '../../components/App';
import {
  Breadcrumb,
  TextField,
  PrimaryButton,
  Dropdown,
} from '@fluentui/react';
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
  const [selectedOption, setSelectedOption] = useState();

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
                      placeholder='978-80-7391-816-3'
                      required
                    />
                  }
                  name='isbn'
                  control={control}
                  rules={{ required: true }}
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
                      label='Příjmení autora'
                      placeholder='Menzel'
                      required
                    />
                  }
                  name='authorFamilyName'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='Jméno autora'
                      placeholder='Jiří'
                      required
                    />
                  }
                  name='authorGivenName'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='Forma, žánr'
                      description='Žánry rozdělte pouze čárkami bez mezer.'
                      placeholder='autobiografie'
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
                      placeholder='https://www.obalkyknih.cz/file/cover/808935/medium'
                      required
                    />
                  }
                  name='coverUrl'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='Anotace'
                      placeholder='Ve vzpomínkovém vyprávění Jiří Menzel popisuje své dětství a formující kulturní zázemí pražské měšťanské rodiny, studium na FAMU a okolnosti svého rozhodnutí pro film navzdory tomu, že jeho původní láskou bylo divadlo, realizaci svých nejslavnějších snímků, jako byly Ostře sledované vlaky a Rozmarné léto v době filmové „nové vlny". Za první z nich získal Jiří Menzel Oscara a stal se jedním z „mužů roku 1968", a proto je popis následujícího období, dusných sedmdesátých let, bizarním příběhem o boji proti tuposti a neschopnosti nadřízených a stranicko-úřednického aparátu, o handlech a kompromisech. Memoáry jsou dovedeny do roku 1988, na práh obnovení svobody v Československu. Díky propojení autorova osobního a profesního života s historicko-společenskou realitou dostává čtenář do ruky také část historie české společnosti v poválečném období. Osobněji laděné vzpomínky jsou obsahem monografických podkapitol, v nichž na učitele (především na Otakara Vávru), kameramany, herce, filmové kritiky, postavy „filmové diplomacie". Nejde tu (jen) o příslovečné veselé příhody z natáčení, Jiří Menzel poskytuje zejména vhled do geneze a utváření své tvůrčí metody, svých názorů na film a přesvědčení o tom, jak se má dělat. Jako červená nit se pak celým textem táhne jednoduchá maxima: Chci dělat filmy tak, aby se líbily lidem a aby na ně lidé rádi chodili.'
                      multiline
                      rows={3}
                      required
                    />
                  }
                  name='annotation'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField label='Rok vydání' placeholder='2014' required />
                  }
                  name='publicationYear'
                  control={control}
                  rules={{ required: true, valueAsNumber: true }}
                />

                <Controller
                  as={
                    <TextField
                      label='Vydavatel'
                      placeholder='Slovart'
                      required
                    />
                  }
                  name='publisher'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={
                    <TextField label='Rok zápisu' placeholder='2021' required />
                  }
                  name='registrationYear'
                  control={control}
                  rules={{ required: true, valueAsNumber: true }}
                />

                <Controller
                  as={
                    <TextField label='Rok odpisu' placeholder='2024' required />
                  }
                  name='deaccessYear'
                  control={control}
                  rules={{ required: true, valueAsNumber: true }}
                />

                <Controller
                  render={({ onChange, value }) => (
                    <Dropdown
                      placeholder='Vyberte možnost'
                      label='Pořízeno'
                      selectedKey={value}
                      // eslint-disable-next-line react/jsx-no-bind
                      onChange={(ev, option, index) => {
                        setSelectedOption(option.key);
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
                      required
                    />
                  )}
                  name='origin'
                  control={control}
                  rules={{ required: true }}
                />

                <Controller
                  as={<TextField label='Cena' placeholder='499' required />}
                  name='purchasePrice'
                  control={control}
                  rules={{ required: true, valueAsNumber: true }}
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
                  <th>Příjmení autora</th>
                  <td>{book.authorFamilyName}</td>
                </tr>
                <tr>
                  <th>Jméno autora</th>
                  <td>{book.authorGivenName}</td>
                </tr>
                <tr>
                  <th>Forma, žánr</th>
                  <td>{book.genre}</td>
                </tr>
                <tr>
                  <th>Odkaz k obálce</th>
                  <td>
                    <a href={book.coverUrl}>{book.coverUrl}</a>
                  </td>
                </tr>
                <tr>
                  <th>Anotace</th>
                  <td>{book.annotation}</td>
                </tr>
                <tr>
                  <th>Rok vydán</th>
                  <td>{book.publicationYear}</td>
                </tr>
                <tr>
                  <th>Vydavatel</th>
                  <td>{book.publisher}</td>
                </tr>
                <tr>
                  <th>Rok zápisu</th>
                  <td>{book.registrationYear}</td>
                </tr>
                <tr>
                  <th>Rok odpisu</th>
                  <td>{book.deaccessYear}</td>
                </tr>
                <tr>
                  <th>Pořízeno</th>
                  <td>{book.origin}</td>
                </tr>
                <tr>
                  <th>Cena</th>
                  <td>{book.purchasePrice}</td>
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
