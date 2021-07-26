import React from 'react';
import styled from 'styled-components';
import Title from '../components/Title';

const _404 = styled(({ className }) => {
  return (
    <div className={className}>
      <Title text='Stránka nebyla nalezena' />
      <h1>Stránka nebyla nalezena</h1>
    </div>
  );
})`
  margin: 1em 0 0 2em;
`;

export default _404;
