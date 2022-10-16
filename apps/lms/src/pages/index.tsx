import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

import { Layout } from '@lms/ui';
import { useUserPhoto } from '@src/hooks';
import {
  loggedInSidebarItems,
  loggedOutSidebarItems,
} from '@src/constants';
import { loginRequest } from '@src/config';
import {
  Home as HomeComp,
  Notifications,
  CurrentlyIssuedBooks,
  PendingRequests,
  History,
  Contact,
  Search,
  BookDetails,
  LikedBooks,
} from '@src/components/Contents';
import { useSidebar } from '@src/contexts/SidebarContext';

const sidebarItems = loggedInSidebarItems.map((item) =>
  item.name.toLowerCase()
);

const Home: NextPage = () => {
  const isAuthenticated = useIsAuthenticated();
  const { accounts, instance } = useMsal();
  const { photo } = useUserPhoto();
  const { sidebarOpen, showHideSidebar } = useSidebar();
  const router = useRouter();

  const loggedIn = isAuthenticated && accounts.length > 0;

  useEffect(() => {
    const authenticatedPages = [
      'notifications',
      'currently issued books',
      'borrow requests',
      'history',
      'my likes',
    ];

    function checkPage() {
      if (
        authenticatedPages.includes(
          decodeURIComponent(router.query.page as string)
        )
      ) {
        if (!isAuthenticated) {
          router.push(
            {
              pathname: '/',
              query: {
                ...router.query,
                page: 'home',
              },
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

  const renderContent = () => {
    if (
      router.query.page &&
      !sidebarItems.includes(
        decodeURIComponent(router.query.page as string)
      )
    ) {
      return (
        <section className='w-full h-full flex justify-center items-center'>
          <h1 className='text-3xl font-medium'>Page Not Found</h1>
        </section>
      );
    }

    const page = decodeURIComponent(router.query.page as string);

    return (
      <>
        {router.query.bookId && <BookDetails />}
        {(router.asPath === '/' ||
          router.asPath.includes('/?page=home') ||
          page === 'home' ||
          !router.query.page) && <HomeComp />}
        {page === 'search' && !router.query.bookId && <Search />}
        {isAuthenticated && page === 'notifications' && <Notifications />}
        {isAuthenticated && page === 'currently issued books' && (
          <CurrentlyIssuedBooks />
        )}
        {isAuthenticated && page === 'borrow requests' && (
          <PendingRequests />
        )}
        {isAuthenticated && page === 'history' && <History />}
        {isAuthenticated && page === 'my likes' && <LikedBooks />}
        {page === 'contact' && <Contact />}
      </>
    );
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
      showNotification
      // TODO: dynamic notification
      hasNewNotification={false}
    >
      {renderContent()}
    </Layout>
  );
};

export default Home;
