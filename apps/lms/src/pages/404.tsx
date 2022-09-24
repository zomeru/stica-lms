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
import { useSidebar } from '@src/contexts/SidebarContext';

const NotFoundPage: NextPage = () => {
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
            { shallow: router.pathname !== '/404' }
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
      <section className='w-full h-full flex justify-center items-center'>
        <h1 className='text-3xl font-medium'>Page Not Found</h1>
      </section>
    </Layout>
  );
};

export default NotFoundPage;
