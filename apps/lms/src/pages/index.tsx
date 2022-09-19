import React from 'react';
import type { NextPage } from 'next';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Layout } from 'ui';

import { usePhoto } from '@src/hooks';
import {
  loggedInSidebarItems,
  loggedOutSidebarItems,
} from '@src/constants';
import { loginRequest } from '@src/config';

const Home: NextPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts, instance } = useMsal();
  const { photo } = usePhoto();

  const loggedIn = isAuthenticated && accounts.length > 0;

  const loginHandler = () => {
    instance.loginRedirect(loginRequest);
  };

  const logoutHandler = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: '/',
    });
  };

  return (
    <Layout
      isAuthenticated={isAuthenticated}
      sidebarItems={
        loggedIn ? loggedInSidebarItems : loggedOutSidebarItems
      }
      authAction={loggedIn ? logoutHandler : loginHandler}
      username={accounts[0]?.name?.replace(' (Student)', '')}
      userPhoto={photo || undefined}
    />
  );
};

export default Home;
