import React from 'react';
import { Helmet } from 'react-helmet';

const Title = ({ text }) => {
  return <Helmet title={text} />;
};

export default Title;
