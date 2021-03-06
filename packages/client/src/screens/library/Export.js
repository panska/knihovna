import React, { useContext, useState } from 'react';
import { Context } from '../../components/App';
import { Breadcrumb, PrimaryButton } from '@fluentui/react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import jsonexport from 'jsonexport/dist';

const Export = withRouter(({ history }) => {
  const [state, dispatch] = useContext(Context);
  const [exported, setExported] = useState();

  const _export = () => {
    axios.get('/api/book/all?include=deaccessed').then((res) => {
      jsonexport(res.data, (err, csv) => {
        if (err) return console.error(err);
        let url = window.URL || window.webkitURL;
        let blob = new Blob([`\uFEFF${csv}`], {
          type: 'text/csv;charset=utf-8',
        });
        let download = url.createObjectURL(blob);
        window.open(download);
        setExported(true);
      });
    });
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
              text: 'Export databáze',
              key: 'f3',
              as: 'p',
            },
          ]}
        />

        {!exported && (
          <>
            <div className='manage form heading'>
              <h1>Export databáze</h1>
              <p>Výsledný soubor lze otevřít v Microsoft Excelu.</p>
            </div>

            <div className='manage form container'>
              <form>
                <PrimaryButton
                  className='submit'
                  text='Export'
                  onClick={_export}
                />
              </form>
            </div>
          </>
        )}

        {exported && (
          <>
            <div className='manage form heading'>
              <h1>Export databáze problěhl úspěšně.</h1>
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

export default Export;
