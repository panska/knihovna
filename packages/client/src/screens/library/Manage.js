import React, { useContext } from 'react';
import { Context } from '../../components/App';
import { Link } from '@fluentui/react';
import { Link as RouterLink } from 'react-router-dom';

const Manage = () => {
  const [state, dispatch] = useContext(Context);

  if (state.permissions && state.permissions.includes('SPRAVCE_KNIHOVNY')) {
    return (
      <div className='manage'>
        <div className='heading'>
          <h1>Správa knihovny</h1>
        </div>

        <div className='nav'>
          <ul>
            <li>
              <Link as={RouterLink} to='/knihovna/sprava/pridat-knihu'>
                Přidat knihu do databáze
              </Link>
            </li>
            <li>
              <Link
                as={RouterLink}
                to='/knihovna/sprava/upravit-zaznam-knihy'
                disabled={true}
              >
                Upravit záznam knihy
              </Link>
            </li>
            <li>
              <Link as={RouterLink} to='/knihovna/sprava/odstranit-knihu'>
                Odstranit knihu z databáze
              </Link>
            </li>
            <li>
              <Link as={RouterLink} to='/knihovna/sprava/vypujcky'>
                Výpůjčky
              </Link>
            </li>
            <li>
              <Link as={RouterLink} to='/knihovna/sprava/vypujcit-knihu'>
                Vypůjčit knihu
              </Link>
            </li>
            <li>
              <Link
                as={RouterLink}
                to='/knihovna/sprava/prodlouzit-vypujcku'
                disabled={true}
              >
                Prodloužit výpůjčku
              </Link>
            </li>
            <li>
              <Link as={RouterLink} to='/knihovna/sprava/vratit-knihu'>
                Vrátit knihu
              </Link>
            </li>
            <li>
              <Link as={RouterLink} to='/knihovna/sprava/export-databaze'>
                Export databáze
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className='heading'>
          <h1>Přístup zakázán</h1>
        </div>
      </div>
    );
  }
};

export default Manage;
