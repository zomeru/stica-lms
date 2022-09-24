import { useLayoutEffect } from 'react';
import type { NextPage } from 'next';
import Router from 'next/router';

const NotFoundPage: NextPage = () => {
  useLayoutEffect(() => {
    Router.push({
      pathname: '/',
      query: {
        page: 'notfound',
      },
    });
  }, []);

  return null;
};

export default NotFoundPage;
