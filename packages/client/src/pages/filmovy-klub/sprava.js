import React, { useContext } from 'react';
import { Context } from '../../components/App';
import { Link } from '@fluentui/react';
import { Link as RouterLink } from 'react-router-dom';
import Title from '../../components/Title';

const Sprava = () => {
  const [state, dispatch] = useContext(Context);

  if (
    state.permissions &&
    state.permissions.includes('SPRAVCE_FILMOVEHO_KLUBU')
  ) {
    return (
      <div className='manage'>
        <Title text='Správa filmového klubu' />
        <div className='heading'>
          <h1>Správa filmového klubu</h1>
        </div>

        <div className='nav'>
          <ul>
            <li>
              <Link
                as={RouterLink}
                to='/filmovy-klub/sprava/naplanovat-projekci'
              >
                Naplánovat projekci
              </Link>
            </li>
            <li>
              <Link
                as={RouterLink}
                to='/filmovy-klub/sprava/upravit-naplanovanou-projekci'
              >
                Upravit naplánovanou projekci
              </Link>
            </li>
            <li>
              <Link
                as={RouterLink}
                to='/filmovy-klub/sprava/zrusit-naplanovanou-projekci'
              >
                Zrušit naplánovanou projekci
              </Link>
            </li>
            <li>
              <Link as={RouterLink} to='/filmovy-klub/sprava/projekce'>
                Projekce
              </Link>
            </li>
          </ul>
        </div>
      </div>
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
};

export default Sprava;
