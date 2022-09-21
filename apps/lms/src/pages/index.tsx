import React from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Layout } from 'ui';

import { usePhoto } from '@src/hooks';
import {
  loggedInSidebarItems,
  loggedOutSidebarItems,
} from '@src/constants';
import { loginRequest } from '@src/config';
import {
  Home as HomeComp,
  Messages,
  CurrentlyIssuedBooks,
  PendingRequests,
  History,
  Contact,
} from '@src/components/Contents';

const Home: NextPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts, instance } = useMsal();
  const { photo } = usePhoto();
  const router = useRouter();

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
    >
      {(router.asPath === '/' ||
        router.asPath.includes('/?page=home') ||
        router.query.page === 'home') && <HomeComp />}
      {router.query.page === 'messages' && <Messages />}
      {router.query.page === 'currently-issued-books' && (
        <CurrentlyIssuedBooks />
      )}
      {router.query.page === 'pending-requests' && <PendingRequests />}
      {router.query.page === 'history' && <History />}
      {router.query.page === 'contact' && <Contact />}
    </Layout>
  );
};

export default Home;
