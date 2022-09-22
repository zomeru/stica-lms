import React, { useEffect } from 'react';
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
import { useSidebar } from '@src/contexts/SidebarContext';

const Home: NextPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts, instance } = useMsal();
  const { photo } = usePhoto();
  const { sidebarOpen, showHideSidebar } = useSidebar();
  const router = useRouter();

  const loggedIn = isAuthenticated && accounts.length > 0;

  useEffect(() => {
    const authenticatedPages = [
      'messages',
      'currently-issued-books',
      'pending-requests',
      'history',
    ];

    function checkPage() {
      if (authenticatedPages.includes(router.query.page as string)) {
        if (!isAuthenticated) {
          router.push(
            {
              pathname: '/',
              query: { page: 'home' },
            },
            undefined,
            { shallow: true }
          );
        }
      }
    }

    checkPage();
  }, [isAuthenticated, router.query]);

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
      sidebarOpen={sidebarOpen}
      showHideSidebar={showHideSidebar}
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
        router.query.page === 'home' ||
        !router.query.page) && <HomeComp />}
      {isAuthenticated && router.query.page === 'messages' && <Messages />}
      {isAuthenticated &&
        router.query.page === 'currently-issued-books' && (
          <CurrentlyIssuedBooks />
        )}
      {isAuthenticated && router.query.page === 'pending-requests' && (
        <PendingRequests />
      )}
      {isAuthenticated && router.query.page === 'history' && <History />}
      {router.query.page === 'contact' && <Contact />}
    </Layout>
  );
};

export default Home;
